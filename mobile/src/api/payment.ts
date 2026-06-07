import { apiDelete, apiGet, apiPost } from '@/api/client'

export type PaymentCardDTO = {
	id: string
	brand: string
	last4: string
	expMonth: number
	expYear: number
	name: string | null
}

export type CheckoutTotalsDTO = {
	subtotalUsd: number
	taxUsd: number
	totalUsd: number
	amountCents: number
}

export type CheckoutStartResponse = {
	free: boolean
	isEnrolled?: boolean
	totals: CheckoutTotalsDTO
	clientSecret: string | null
	paymentIntentId: string | null
}

export type PaymentSheetParamsDTO =
	| {
			free: true
			isEnrolled: boolean
			totals: CheckoutTotalsDTO
	  }
	| {
			free: false
			clientSecret: string
			ephemeralKey: string
			customerId: string
			paymentIntentId: string
			publishableKey: string
			totals: CheckoutTotalsDTO
	  }

export const getPaymentCards = () => apiGet<PaymentCardDTO[]>('/payment/cards')

export const attachPaymentCard = (paymentMethodId: string) =>
	apiPost<PaymentCardDTO[]>('/payment/cards', { paymentMethodId })

export const deletePaymentCard = (paymentMethodId: string) =>
	apiDelete<PaymentCardDTO[]>(`/payment/cards/${paymentMethodId}`)

export const startCheckout = (courseId: string, paymentMethodId?: string) =>
	apiPost<CheckoutStartResponse>('/payment/checkout', {
		courseId,
		...(paymentMethodId ? { paymentMethodId } : {}),
	})

export const getPaymentSheetParams = (courseId: string) =>
	apiPost<PaymentSheetParamsDTO>('/payment/sheet', { courseId })

export const confirmCheckout = (courseId: string, paymentIntentId: string) =>
	apiPost<{ isEnrolled: boolean }>('/payment/checkout/confirm', {
		courseId,
		paymentIntentId,
	})
