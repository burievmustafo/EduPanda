import { Schema, model, models } from 'mongoose'

// Student video ichidagi savolga bergan javobi (DATABASE_AND_API_PLAN.md §5.2).
const TimedQuestionAnswerSchema = new Schema(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User' },
		lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
		question: { type: Schema.Types.ObjectId, ref: 'TimedQuestion' },
		selectedOptionId: String,
		isCorrect: { type: Boolean, default: false },
		skipped: { type: Boolean, default: false },
		videoTimeSec: Number,
		answeredAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

// Bir savolga bir javob (student bo'yicha).
TimedQuestionAnswerSchema.index({ student: 1, question: 1 }, { unique: true })

const TimedQuestionAnswer =
	models.TimedQuestionAnswer ||
	model('TimedQuestionAnswer', TimedQuestionAnswerSchema)
export default TimedQuestionAnswer
