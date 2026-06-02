import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { lessonDurationSec } from '@/lib/mobile/dto'
import { mergeRanges, watchedSeconds } from '@/lib/mobile/ranges'
import Lesson from '@/database/lesson.model'
import Section from '@/database/section.model'
import LessonProgress from '@/database/lesson-progress.model'

export async function POST(
	req: Request,
	{ params }: { params: { lessonId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const body = await req.json().catch(() => ({}))
		const incoming = Array.isArray(body.watchedRanges) ? body.watchedRanges : []
		const lastPositionSec = Number(body.lastPositionSec) || 0

		const lesson = await Lesson.findById(params.lessonId).lean()
		if (!lesson) throw new ApiError(404, 'not_found', 'Lesson not found')

		const section = await Section.findById((lesson as any).section)
			.select('course')
			.lean()
		const duration = lessonDurationSec(lesson)

		const prev = await LessonProgress.findOne({
			student: user._id,
			lesson: (lesson as any)._id,
		}).lean()
		const merged = mergeRanges([...(((prev as any)?.watchedRanges) || []), ...incoming])
		const watchedSec = watchedSeconds(merged)
		const percent =
			duration > 0 ? Math.min(100, Math.round((watchedSec / duration) * 100)) : 0
		const isCompleted = percent >= 90

		await LessonProgress.findOneAndUpdate(
			{ student: user._id, lesson: (lesson as any)._id },
			{
				student: user._id,
				lesson: (lesson as any)._id,
				course: (section as any)?.course,
				watchedRanges: merged,
				watchedSeconds: watchedSec,
				watchedPercent: percent,
				lastPositionSec,
				isCompleted,
			},
			{ upsert: true }
		)

		return ok({ watchedPercent: percent, isCompleted })
	} catch (e) {
		return handleError(e)
	}
}
