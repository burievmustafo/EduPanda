import { ApiError, handleError, ok, requireUser } from '@/lib/mobile/api'
import ParentStudentLink from '@/database/parent-student-link.model'

function makeCode() {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		if (role !== 'student') {
			throw new ApiError(403, 'forbidden', 'Only students can create invite codes')
		}

		let code = makeCode()
		for (let i = 0; i < 5; i++) {
			const exists = await ParentStudentLink.exists({
				code,
				status: 'pending',
			})
			if (!exists) break
			code = makeCode()
		}

		const link = await ParentStudentLink.findOneAndUpdate(
			{ student: user._id, status: 'pending' },
			{
				student: user._id,
				status: 'pending',
				code,
				activatedAt: null,
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		)

		return ok({ code: link.code })
	} catch (e) {
		return handleError(e)
	}
}
