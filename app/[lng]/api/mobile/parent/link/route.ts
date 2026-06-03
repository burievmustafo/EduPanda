import { ApiError, handleError, ok, requireUser } from '@/lib/mobile/api'
import ParentStudentLink from '@/database/parent-student-link.model'
import User from '@/database/user.model'

export async function POST(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		if (role !== 'parent') {
			throw new ApiError(403, 'forbidden', 'Only parents can link children')
		}

		const body = await req.json().catch(() => ({}))
		const code = String(body?.code || '').trim()
		if (!code) throw new ApiError(422, 'validation', 'Invite code is required')

		const invite = await ParentStudentLink.findOne({
			code,
			status: 'pending',
		})
		if (!invite) throw new ApiError(404, 'not_found', 'Invite code not found')

		const student = await User.findById(invite.student).select(
			'fullName picture email role'
		)
		if (!student) throw new ApiError(404, 'not_found', 'Student not found')

		await ParentStudentLink.findOneAndUpdate(
			{ parent: user._id, student: student._id },
			{
				parent: user._id,
				student: student._id,
				status: 'active',
				activatedAt: new Date(),
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		)

		invite.status = 'revoked'
		await invite.save()

		return ok({
			studentId: String(student._id),
			fullName: student.fullName,
			picture: student.picture,
		})
	} catch (e) {
		return handleError(e)
	}
}
