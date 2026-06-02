import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { toQuizDTO } from '@/lib/mobile/dto'
import SectionQuiz from '@/database/section-quiz.model'
import QuizQuestion from '@/database/quiz-question.model'

export async function GET(
	req: Request,
	{ params }: { params: { sectionId: string } }
) {
	try {
		await requireUser(req)
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
