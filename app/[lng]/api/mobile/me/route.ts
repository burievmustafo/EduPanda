import { requireUser, ok, handleError, mapRole } from '@/lib/mobile/api'

export async function GET(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		return ok({
			id: String(user._id),
			clerkId: user.clerkId,
			fullName: user.fullName,
			email: user.email,
			picture: user.picture,
			role,
		})
	} catch (e) {
		return handleError(e)
	}
}

// Role onboarding (student | teacher | parent)
export async function PATCH(req: Request) {
	try {
		const { user } = await requireUser(req)
		const body = await req.json().catch(() => ({}))
		const role = body?.role
		if (['student', 'teacher', 'parent'].includes(role)) {
			user.role = role
			if (role === 'teacher') user.approvedInstructor = true
			await user.save()
		}
		return ok({ id: String(user._id), role: mapRole(user) })
	} catch (e) {
		return handleError(e)
	}
}
