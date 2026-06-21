import QuizAttempt from '@/database/quiz-attempt.model'

const txt = (v?: { en?: string; ja?: string }) => v?.en || v?.ja || ''
const localized = (v?: { en?: string; ja?: string }) => {
	const en = v?.en || v?.ja || ''
	return v?.ja ? { en, ja: v.ja } : { en }
}

export function serializeQuizAttempt(
	attempt: any,
	questions: any[],
	options: { localizedExplanation?: boolean } = {}
) {
	if (!attempt) return null

	const questionById = new Map(questions.map((q: any) => [String(q._id), q]))
	const review = (attempt.answers || []).map((answer: any) => {
		const questionId = String(answer.question)
		const question = questionById.get(questionId)
		return {
			questionId,
			selectedOptionId: answer.selectedOptionId || '',
			correctOptionId: question?.correctOptionId || '',
			isCorrect: Boolean(answer.isCorrect),
			explanation: options.localizedExplanation
				? question?.explanation
					? localized(question.explanation)
					: undefined
				: txt(question?.explanation) || undefined,
		}
	})

	return {
		attemptId: String(attempt._id),
		totalQuestions: attempt.totalQuestions || questions.length,
		correctAnswers: attempt.correctAnswers || 0,
		score: attempt.score || 0,
		passed: Boolean(attempt.passed),
		review,
		submittedAt: attempt.submittedAt,
	}
}

export async function getLatestQuizAttempt(params: {
	studentId: unknown
	quizId: unknown
	questions: any[]
	localizedExplanation?: boolean
}) {
	const attempt = await QuizAttempt.findOne({
		student: params.studentId,
		quiz: params.quizId,
	})
		.sort({ submittedAt: -1, createdAt: -1 })
		.lean()

	return serializeQuizAttempt(attempt, params.questions, {
		localizedExplanation: params.localizedExplanation,
	})
}

export async function getQuizAttempts(params: {
	studentId: unknown
	quizId: unknown
	questions: any[]
	localizedExplanation?: boolean
	limit?: number
}) {
	const attempts = await QuizAttempt.find({
		student: params.studentId,
		quiz: params.quizId,
	})
		.sort({ submittedAt: -1, createdAt: -1 })
		.limit(params.limit ?? 10)
		.lean()

	return attempts
		.map(attempt =>
			serializeQuizAttempt(attempt, params.questions, {
				localizedExplanation: params.localizedExplanation,
			})
		)
		.filter(Boolean)
}
