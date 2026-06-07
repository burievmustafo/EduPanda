import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { lessonDurationSec } from '@/lib/mobile/dto'
import Lesson from '@/database/lesson.model'
import Section from '@/database/section.model'
import LessonProgress from '@/database/lesson-progress.model'

export async function POST(
	req: Request,
	{ params }: { params: { lessonId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const lesson = await Lesson.findById(params.lessonId).lean()
		if (!lesson) throw new ApiError(404, 'not_found', 'Lesson not found')

		const section = await Section.findById((lesson as any).section)
			.select('course')
			.lean()
		if (!section) throw new ApiError(404, 'not_found', 'Section not found')

		const duration = lessonDurationSec(lesson)
		const prev = await LessonProgress.findOne({
			student: user._id,
			lesson: (lesson as any)._id,
		}).lean()

		const watchedPercent = Math.max((prev as any)?.watchedPercent ?? 0, 90)
		const watchedSeconds = Math.max(
			(prev as any)?.watchedSeconds ?? 0,
			duration > 0 ? Math.round(duration * 0.9) : 0
		)

		await LessonProgress.findOneAndUpdate(
			{ student: user._id, lesson: (lesson as any)._id },
			{
				student: user._id,
				lesson: (lesson as any)._id,
				course: (section as any).course,
				isCompleted: true,
				watchedPercent,
				watchedSeconds,
				lastPositionSec: (prev as any)?.lastPositionSec ?? 0,
				watchedRanges: (prev as any)?.watchedRanges ?? [],
			},
			{ upsert: true }
		)

		return ok({ isCompleted: true, watchedPercent })
	} catch (e) {
		return handleError(e)
	}
}
