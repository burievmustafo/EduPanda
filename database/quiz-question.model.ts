import { Schema, model, models } from 'mongoose'

// Section testidagi savol (DATABASE_AND_API_PLAN.md §5.4).
const OptionSchema = new Schema(
	{
		id: String,
		text: { en: String, ja: String },
	},
	{ _id: false }
)

const QuizQuestionSchema = new Schema(
	{
		quiz: { type: Schema.Types.ObjectId, ref: 'SectionQuiz' },
		question: { en: String, ja: String },
		options: [OptionSchema],
		correctOptionId: String, // ⚠️ mijozga yuborilmaydi
		explanation: { en: String, ja: String },
		order: { type: Number, default: 0 },
	},
	{ timestamps: true }
)

const QuizQuestion =
	models.QuizQuestion || model('QuizQuestion', QuizQuestionSchema)
export default QuizQuestion
