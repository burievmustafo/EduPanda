import { Schema, model, models } from 'mongoose'

// Student section testini topshirgan natijasi (DATABASE_AND_API_PLAN.md §5.5).
const AttemptAnswerSchema = new Schema(
	{
		question: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
		selectedOptionId: String,
		isCorrect: Boolean,
	},
	{ _id: false }
)

const QuizAttemptSchema = new Schema(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User' },
		quiz: { type: Schema.Types.ObjectId, ref: 'SectionQuiz' },
		section: { type: Schema.Types.ObjectId, ref: 'Section' },
		answers: [AttemptAnswerSchema],
		totalQuestions: Number,
		correctAnswers: Number,
		score: Number, // foizda
		passed: Boolean,
		startedAt: { type: Date, default: Date.now },
		submittedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

QuizAttemptSchema.index({ student: 1, quiz: 1 })

const QuizAttempt =
	models.QuizAttempt || model('QuizAttempt', QuizAttemptSchema)
export default QuizAttempt
