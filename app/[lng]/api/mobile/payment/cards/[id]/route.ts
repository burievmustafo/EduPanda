import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { removePaymentCard } from '@/lib/mobile/payment'

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const cards = await removePaymentCard(user.clerkId, params.id)
		return ok(cards)
	} catch (e) {
		return handleError(e)
	}
}
