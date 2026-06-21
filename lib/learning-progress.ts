import Lesson from '@/database/lesson.model'
import LessonProgress from '@/database/lesson-progress.model'
import Section from '@/database/section.model'
import User from '@/database/user.model'
import UserProgress from '@/database/user-progress.model'

type LessonId = string | { toString(): string }

export async function markUserProgressComplete(clerkId: string, lessonId: LessonId) {
	const id = String(lessonId)
	const progress = await UserProgress.findOneAndUpdate(
		{ userId: clerkId, lessonId: id },
		{ userId: clerkId, lessonId: id, isCompleted: true },
		{ upsert: true, new: true }
	)
	await Lesson.findByIdAndUpdate(id, { $addToSet: { userProgress: progress._id } })
	return progress
}

export async function syncLessonProgressFromClerk(params: {
	clerkId: string
	lessonId: LessonId
	watchedPercent?: number
	watchedSeconds?: number
	lastPositionSec?: number
	watchedRanges?: Array<{ start: number; end: number }>
	isCompleted?: boolean
}) {
	const user = await User.findOne({ clerkId: params.clerkId }).select('_id').lean()
	if (!user) return null

	const lesson = await Lesson.findById(String(params.lessonId)).select('section').lean()
	if (!lesson) return null

	const section = await Section.findById((lesson as any).section).select('course').lean()
	const current = await LessonProgress.findOne({
		student: (user as any)._id,
		lesson: (lesson as any)._id,
	}).lean()

	const watchedPercent = Math.max(
		Number((current as any)?.watchedPercent || 0),
		Number(params.watchedPercent || 0)
	)
	const watchedSeconds = Math.max(
		Number((current as any)?.watchedSeconds || 0),
		Number(params.watchedSeconds || 0)
	)

	return LessonProgress.findOneAndUpdate(
		{ student: (user as any)._id, lesson: (lesson as any)._id },
		{
			student: (user as any)._id,
			lesson: (lesson as any)._id,
			course: (section as any)?.course,
			watchedRanges: params.watchedRanges ?? (current as any)?.watchedRanges ?? [],
			watchedSeconds,
			watchedPercent,
			lastPositionSec: params.lastPositionSec ?? (current as any)?.lastPositionSec ?? 0,
			isCompleted: Boolean(params.isCompleted || (current as any)?.isCompleted),
		},
		{ upsert: true, new: true }
	)
}

export async function countCompletedLessons(params: {
	clerkId?: string
	studentId?: unknown
	lessonIds: LessonId[]
}) {
	const ids = params.lessonIds.map(String)
	const completed = new Set<string>()

	if (params.clerkId) {
		const legacy = await UserProgress.find({
			userId: params.clerkId,
			lessonId: { $in: ids },
			isCompleted: true,
		})
			.select('lessonId')
			.lean()
		legacy.forEach((p: any) => completed.add(String(p.lessonId)))
	}

	if (params.studentId) {
		const rich = await LessonProgress.find({
			student: params.studentId,
			lesson: { $in: ids },
			isCompleted: true,
		})
			.select('lesson')
			.lean()
		rich.forEach((p: any) => completed.add(String(p.lesson)))
	}

	return completed.size
}

export async function getLessonProgressMap(params: {
	clerkId?: string
	studentId?: unknown
	lessonIds: LessonId[]
}) {
	const ids = params.lessonIds.map(String)
	const map = new Map<string, any>()

	if (params.studentId) {
		const rich = await LessonProgress.find({
			student: params.studentId,
			lesson: { $in: ids },
		}).lean()
		rich.forEach((p: any) => map.set(String(p.lesson), p))
	}

	if (params.clerkId) {
		const legacy = await UserProgress.find({
			userId: params.clerkId,
			lessonId: { $in: ids },
			isCompleted: true,
		}).lean()
		legacy.forEach((p: any) => {
			const id = String(p.lessonId)
			if (!map.has(id)) {
				map.set(id, {
					lesson: id,
					watchedPercent: 100,
					lastPositionSec: 0,
					isCompleted: true,
				})
			}
		})
	}

	return map
}
