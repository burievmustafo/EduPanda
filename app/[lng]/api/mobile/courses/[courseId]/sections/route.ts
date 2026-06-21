import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { toLessonListItem, toSectionDTO } from '@/lib/mobile/dto'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import SectionQuiz from '@/database/section-quiz.model'
import { getLessonProgressMap } from '@/lib/learning-progress'

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const sections = await Section.find({ course: params.courseId })
			.sort({ position: 1 })
			.lean()

		const result = []
		for (const sec of sections) {
			const lessons = await Lesson.find({ section: sec._id })
				.sort({ position: 1 })
				.lean()
			const progByLesson = await getLessonProgressMap({
				clerkId: user.clerkId,
				studentId: user._id,
				lessonIds: lessons.map((l: any) => l._id),
			})
			const lessonItems = lessons.map((l: any) =>
				toLessonListItem(l, progByLesson.get(String(l._id)))
			)
			const hasQuiz = Boolean(await SectionQuiz.exists({ section: sec._id }))
			result.push(toSectionDTO(sec, lessonItems, hasQuiz))
		}
		return ok(result)
	} catch (e) {
		return handleError(e)
	}
}
