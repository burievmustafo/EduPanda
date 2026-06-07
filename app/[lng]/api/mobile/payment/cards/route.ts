import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import {
	attachPaymentCard,
	listPaymentCards,
} from '@/lib/mobile/payment'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const cards = await listPaymentCards(user.clerkId)
		return ok(cards)
	} catch (e) {
		return handleError(e)
	}
}

export async function POST(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const body = await req.json().catch(() => ({}))
		const paymentMethodId =
			typeof body.paymentMethodId === 'string' ? body.paymentMethodId.trim() : ''
		if (!paymentMethodId) {
			throw new ApiError(400, 'invalid_body', 'paymentMethodId required')
		}
		const cards = await attachPaymentCard(user.clerkId, paymentMethodId)
		return ok(cards)
	} catch (e) {
		return handleError(e)
	}
}
