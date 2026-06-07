import Constants from 'expo-constants'

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

/** Stripe CardField / confirmPayment faqat dev build yoki production APK da ishlaydi. */
export function isStripeNativeSupported(): boolean {
	if (!publishableKey) return false
	// Expo Go (QR) — Stripe native SDK yo'q
	if (Constants.appOwnership === 'expo') return false
	return true
}

export function getStripePublishableKey(): string {
	return publishableKey
}

export function stripeUnavailableReason(
	t: (key: string) => string,
): string {
	if (!publishableKey) return t('payment.stripeNotConfigured')
	if (Constants.appOwnership === 'expo') return t('payment.stripeExpoGo')
	return t('payment.stripeNotConfigured')
}
