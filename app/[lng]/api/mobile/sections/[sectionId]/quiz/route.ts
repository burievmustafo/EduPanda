import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { toQuizDTO } from '@/lib/mobile/dto'
import { hasCourseAccess } from '@/lib/mobile/access'
import SectionQuiz from '@/database/section-quiz.model'
import QuizQuestion from '@/database/quiz-question.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import LessonProgress from '@/database/lesson-progress.model'

export async function GET(
	req: Request,
	{ params }: { params: { sectionId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		const section = await Section.findById(params.sectionId).select('course').lean()
		if (!section) throw new ApiError(404, 'not_found', 'Section not found')
		if (!(await hasCourseAccess((section as any).course, user._id, role))) {
			throw new ApiError(403, 'locked', 'Enroll to access this quiz')
		}
		if (role === 'student') {
			const lessons = await Lesson.find({ section: params.sectionId })
				.select('_id')
				.lean()
			const completed = await LessonProgress.countDocuments({
				student: user._id,
				lesson: { $in: lessons.map((lesson: any) => lesson._id) },
				isCompleted: true,
			})
			if (lessons.length > 0 && completed < lessons.length) {
				throw new ApiError(
					403,
					'quiz_locked',
					'Complete all section lessons before starting the quiz'
				)
			}
		}
		const quiz = await SectionQuiz.findOne({
			section: params.sectionId,
			isPublished: true,
		}).lean()
		if (!quiz) throw new ApiError(404, 'not_found', 'Quiz not found')

		const questions = await QuizQuestion.find({ quiz: (quiz as any)._id }).lean()
		return ok(toQuizDTO(quiz, questions))
	} catch (e) {
		return handleError(e)
	}
}
