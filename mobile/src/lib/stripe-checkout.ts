import {
	confirmCheckout,
	startCheckout,
	type CheckoutStartResponse,
} from '@/api/payment'
import { queryClient } from '@/lib/query-client'

type ConfirmPaymentFn = (
	clientSecret: string,
	data: {
		paymentMethodType: 'Card'
		paymentMethodData: { paymentMethodId: string }
	},
) => Promise<{
	error?: { message: string }
	paymentIntent?: { id: string }
}>

export async function invalidateAfterPurchase(courseId: string) {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: ['courses'] }),
		queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
		queryClient.invalidateQueries({ queryKey: ['sections', courseId] }),
		queryClient.invalidateQueries({ queryKey: ['studentDashboard'] }),
		queryClient.invalidateQueries({ queryKey: ['paymentCards'] }),
	])
}

export function formatCardLabel(card: {
	brand: string
	last4: string
	expMonth: number
	expYear: number
}) {
	const brand = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Card'
	return `${brand} •••• ${card.last4}`
}

export async function completeStripePayment(
	confirmPayment: ConfirmPaymentFn,
	courseId: string,
	paymentMethodId: string,
): Promise<CheckoutStartResponse> {
	const checkout = await startCheckout(courseId, paymentMethodId)

	if (checkout.free) {
		await invalidateAfterPurchase(courseId)
		return checkout
	}

	if (!checkout.clientSecret || !checkout.paymentIntentId) {
		throw new Error('Payment could not be started')
	}

	const { error, paymentIntent } = await confirmPayment(checkout.clientSecret, {
		paymentMethodType: 'Card',
		paymentMethodData: { paymentMethodId },
	})

	if (error) {
		throw new Error(error.message)
	}

	const intentId = paymentIntent?.id ?? checkout.paymentIntentId
	await confirmCheckout(courseId, intentId)
	await invalidateAfterPurchase(courseId)
	return checkout
}
