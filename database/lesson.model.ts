import { Schema, model, models } from 'mongoose'

const LessonSchema = new Schema({
	title: String,
	titleI18n: { en: String, ja: String },
	position: Number,
	content: String,
	contentI18n: { en: String, ja: String },
	videoUrl: String,
	durationSec: { type: Number, default: 0 }, // mobil uchun yagona soniya
	duration: {
		hours: { type: Number, default: 0 },
		minutes: { type: Number, default: 0 },
		seconds: { type: Number, default: 0 },
	},
	section: { type: Schema.Types.ObjectId, ref: 'Section' },
	free: { type: Boolean, default: false },
	userProgress: [{ type: Schema.Types.ObjectId, ref: 'UserProgress' }],
})

const Lesson = models.Lesson || model('Lesson', LessonSchema)
export default Lesson
