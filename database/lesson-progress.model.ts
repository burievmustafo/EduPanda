import { Schema, model, models } from 'mongoose'

// Video ko'rish progressi — watched-ranges asosida (DATABASE_AND_API_PLAN.md §3.2).
// Eski UserProgress (clerkId string) o'rniga, ObjectId ref bilan boyroq model.
const RangeSchema = new Schema(
	{ start: Number, end: Number },
	{ _id: false }
)

const LessonProgressSchema = new Schema(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User' },
		lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
		course: { type: Schema.Types.ObjectId, ref: 'Course' }, // denormalizatsiya (dashboard tez)
		watchedRanges: [RangeSchema],
		watchedSeconds: { type: Number, default: 0 },
		watchedPercent: { type: Number, default: 0 },
		lastPositionSec: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
)

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true })
LessonProgressSchema.index({ student: 1, course: 1 })

const LessonProgress =
	models.LessonProgress || model('LessonProgress', LessonProgressSchema)
export default LessonProgress
