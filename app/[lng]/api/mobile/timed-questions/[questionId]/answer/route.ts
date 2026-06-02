import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import TimedQuestion from '@/database/timed-question.model'
import TimedQuestionAnswer from '@/database/timed-question-answer.model'

export async function POST(
	req: Request,
	{ params }: { params: { questionId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const body = await req.json().catch(() => ({}))
		const selectedOptionId: string | undefined = body.selectedOptionId
		const skipped = Boolean(body.skipped)
		const videoTimeSec = Number(body.videoTimeSec) || 0

		const tq = await TimedQuestion.findById(params.questionId).lean()
		if (!tq) throw new ApiError(404, 'not_found', 'Question not found')

		// Baholash SERVERDA.
		const isCorrect = !skipped && selectedOptionId === (tq as any).correctOptionId

		await TimedQuestionAnswer.findOneAndUpdate(
			{ student: user._id, question: (tq as any)._id },
			{
				student: user._id,
				question: (tq as any)._id,
				lesson: (tq as any).lesson,
				selectedOptionId: selectedOptionId || undefined,
				isCorrect,
				skipped,
				videoTimeSec,
				answeredAt: new Date(),
			},
			{ upsert: true }
		)

		const explanation = (tq as any).explanation
		return ok({
			questionId: String((tq as any)._id),
			isCorrect,
			correctOptionId: (tq as any).correctOptionId,
			explanation: explanation?.en ? li18n(explanation) : undefined,
		})
	} catch (e) {
		return handleError(e)
	}
}
