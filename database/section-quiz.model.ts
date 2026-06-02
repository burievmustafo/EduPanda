import { Schema, model, models } from 'mongoose'

// Section oxiridagi yakuniy test (DATABASE_AND_API_PLAN.md §5.3).
const SectionQuizSchema = new Schema(
	{
		section: { type: Schema.Types.ObjectId, ref: 'Section' },
		title: { en: String, ja: String },
		passScore: { type: Number, default: 70 },
		timeLimitMin: Number,
		isPublished: { type: Boolean, default: true },
	},
	{ timestamps: true }
)

const SectionQuiz =
	models.SectionQuiz || model('SectionQuiz', SectionQuizSchema)
export default SectionQuiz
