import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { deleteNotificationById } from '@/lib/mobile/notifications'

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const deleted = await deleteNotificationById(user.clerkId, params.id)
		if (!deleted) {
			throw new ApiError(404, 'not_found', 'Notification not found')
		}
		return ok({ deleted: true })
	} catch (e) {
		return handleError(e)
	}
}
