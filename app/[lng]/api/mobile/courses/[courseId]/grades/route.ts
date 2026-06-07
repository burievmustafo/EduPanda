import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import Purchase from '@/database/purchase.model'
import Section from '@/database/section.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizAttempt from '@/database/quiz-attempt.model'

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const enrolled = await Purchase.exists({
			user: user._id,
			course: params.courseId,
		})
		if (!enrolled) {
			throw new ApiError(403, 'locked', 'Enroll to view grades')
		}

		const sections = await Section.find({ course: params.courseId })
			.select('_id title titleI18n')
			.lean()
		const secIds = sections.map((s: any) => s._id)
		const secMap = new Map(
			sections.map((s: any) => [String(s._id), li18n(s.titleI18n, s.title)])
		)

		const quizzes = await SectionQuiz.find({ section: { $in: secIds } }).lean()
		const quizIds = quizzes.map((q: any) => q._id)
		const quizMap = new Map(
			quizzes.map((q: any) => [
				String(q._id),
				{ title: li18n(q.title), sectionId: String(q.section) },
			])
		)

		const attempts = await QuizAttempt.find({
			student: user._id,
			quiz: { $in: quizIds },
		})
			.sort({ submittedAt: -1 })
			.lean()

		const grades = attempts.map((a: any) => {
			const quiz = quizMap.get(String(a.quiz))
			const sectionTitle = quiz
				? secMap.get(quiz.sectionId)
				: { en: 'Section' }
			return {
				attemptId: String(a._id),
				quizTitle: quiz?.title ?? { en: 'Quiz' },
				sectionTitle,
				score: a.score ?? 0,
				passed: Boolean(a.passed),
				submittedAt: a.submittedAt,
			}
		})

		return ok({ grades })
	} catch (e) {
		return handleError(e)
	}
}
