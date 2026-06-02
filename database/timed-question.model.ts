import { Schema, model, models } from 'mongoose'

// Video ichida belgilangan vaqtda chiqadigan savol (DATABASE_AND_API_PLAN.md §5.1).
const OptionSchema = new Schema(
	{
		id: String,
		text: { en: String, ja: String },
	},
	{ _id: false }
)

const TimedQuestionSchema = new Schema(
	{
		lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
		triggerTimeSec: Number,
		type: { type: String, default: 'single_choice' },
		question: { en: String, ja: String },
		options: [OptionSchema],
		correctOptionId: String, // ⚠️ mijozga hech qachon yuborilmaydi
		explanation: { en: String, ja: String },
		required: { type: Boolean, default: false },
		isPublished: { type: Boolean, default: true },
		order: { type: Number, default: 0 },
	},
	{ timestamps: true }
)

const TimedQuestion =
	models.TimedQuestion || model('TimedQuestion', TimedQuestionSchema)
export default TimedQuestion
