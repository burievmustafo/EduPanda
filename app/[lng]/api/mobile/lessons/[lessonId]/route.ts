import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { toLessonDetailDTO } from '@/lib/mobile/dto'
import Lesson from '@/database/lesson.model'
import Section from '@/database/section.model'
import TimedQuestion from '@/database/timed-question.model'
import LessonProgress from '@/database/lesson-progress.model'

export async function GET(
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
		const timedQuestions = await TimedQuestion.find({
			lesson: (lesson as any)._id,
			isPublished: true,
		}).lean()
		const progress = await LessonProgress.findOne({
			student: user._id,
			lesson: (lesson as any)._id,
		}).lean()

		const dto = toLessonDetailDTO(
			{ ...(lesson as any), courseId: (section as any)?.course },
			timedQuestions,
			progress
		)
		return ok(dto)
	} catch (e) {
		return handleError(e)
	}
}
