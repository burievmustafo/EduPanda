import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import { hasCourseAccess } from '@/lib/mobile/access'
import SectionQuiz from '@/database/section-quiz.model'
import QuizQuestion from '@/database/quiz-question.model'
import QuizAttempt from '@/database/quiz-attempt.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import { countCompletedLessons } from '@/lib/learning-progress'

export async function POST(
	req: Request,
	{ params }: { params: { quizId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		const body = await req.json().catch(() => ({}))
		const answers: Array<{ questionId: string; selectedOptionId: string }> =
			Array.isArray(body.answers) ? body.answers : []

		const quiz = await SectionQuiz.findById(params.quizId).lean()
		if (!quiz) throw new ApiError(404, 'not_found', 'Quiz not found')
		const section = await Section.findById((quiz as any).section)
			.select('course')
			.lean()
		if (!section) throw new ApiError(404, 'not_found', 'Section not found')
		if (!(await hasCourseAccess((section as any).course, user._id, role))) {
			throw new ApiError(403, 'locked', 'Enroll to submit this quiz')
		}
		if (role === 'student') {
			const lessons = await Lesson.find({ section: (quiz as any).section })
				.select('_id')
				.lean()
			const completed = await countCompletedLessons({
				clerkId: user.clerkId,
				studentId: user._id,
				lessonIds: lessons.map((lesson: any) => lesson._id),
			})
			if (lessons.length > 0 && completed < lessons.length) {
				throw new ApiError(
					403,
					'quiz_locked',
					'Complete all section lessons before submitting the quiz'
				)
			}
		}

		const questions = await QuizQuestion.find({ quiz: (quiz as any)._id }).lean()

		// Baholash FAQAT serverda.
		const review = questions.map((q: any) => {
			const given = answers.find((a) => a.questionId === String(q._id))
			const selectedOptionId = given?.selectedOptionId || ''
			return {
				questionId: String(q._id),
				selectedOptionId,
				correctOptionId: q.correctOptionId,
				isCorrect: selectedOptionId === q.correctOptionId,
				explanation: q.explanation?.en ? li18n(q.explanation) : undefined,
			}
		})

		const correctAnswers = review.filter((r) => r.isCorrect).length
		const totalQuestions = questions.length
		const score =
			totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
		const passed = score >= ((quiz as any).passScore ?? 70)

		const attempt = await QuizAttempt.create({
			student: user._id,
			quiz: (quiz as any)._id,
			section: (quiz as any).section,
			answers: review.map((r) => ({
				question: r.questionId,
				selectedOptionId: r.selectedOptionId,
				isCorrect: r.isCorrect,
			})),
			totalQuestions,
			correctAnswers,
			score,
			passed,
			startedAt: new Date(),
			submittedAt: new Date(),
		})

		return ok({
			attemptId: String(attempt._id),
			totalQuestions,
			correctAnswers,
			score,
			passed,
			review,
		})
	} catch (e) {
		return handleError(e)
	}
}
