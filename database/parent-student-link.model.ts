import { Schema, model, models } from 'mongoose'

// Parent ↔ student bog'lanishi (DATABASE_AND_API_PLAN.md §5.6).
const ParentStudentLinkSchema = new Schema(
	{
		parent: { type: Schema.Types.ObjectId, ref: 'User' },
		student: { type: Schema.Types.ObjectId, ref: 'User' },
		status: {
			type: String,
			enum: ['pending', 'active', 'revoked'],
			default: 'active',
		},
		code: String, // keyingi bosqich: invite code
		activatedAt: Date,
	},
	{ timestamps: true }
)

ParentStudentLinkSchema.index({ parent: 1, student: 1 }, { unique: true })

const ParentStudentLink =
	models.ParentStudentLink ||
	model('ParentStudentLink', ParentStudentLinkSchema)
export default ParentStudentLink
