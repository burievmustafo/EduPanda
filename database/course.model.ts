import { Schema, model, models } from 'mongoose'

const CourseSchema = new Schema(
	{
		title: String,
		description: String,
		learning: String,
		requirements: String,
		// Mobil uchun ikki tilli (additive — web eski String maydonlarni ishlatadi)
		titleI18n: { en: String, ja: String },
		descriptionI18n: { en: String, ja: String },
		learningI18n: { en: String, ja: String },
		requirementsI18n: { en: String, ja: String },
		level: String,
		category: String,
		language: String,
		oldPrice: Number,
		currentPrice: Number,
		previewImage: String,
		published: { type: Boolean, default: false },
		instructor: { type: Schema.Types.ObjectId, ref: 'User' },
		slug: String,
		tags: String,
		purchases: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
	},
	{ timestamps: true }
)

const Course = models.Course || model('Course', CourseSchema)
export default Course
