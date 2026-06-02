import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertQuizOwner, requireTeacher } from '@/lib/mobile/ownership'
import QuizQuestion from '@/database/quiz-question.model'

// Testga savol qo'shish.
export async function POST(
	req: Request,
	{ params }: { params: { quizId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const quiz: any = await assertQuizOwner(params.quizId, user._id)
		const body = await req.json().catch(() => ({}))

		const count = await QuizQuestion.countDocuments({ quiz: quiz._id })
		const q = await QuizQuestion.create({
			quiz: quiz._id,
			question: body.question || { en: '' },
			options: body.options || [],
			correctOptionId: body.correctOptionId || '',
			explanation: body.explanation,
			order: body.order ?? count + 1,
		})

		return ok({ id: String(q._id) })
	} catch (e) {
		return handleError(e)
	}
}
