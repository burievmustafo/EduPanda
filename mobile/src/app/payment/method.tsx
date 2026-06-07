import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useStripe } from '@stripe/stripe-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'

import { confirmCheckout, getPaymentSheetParams } from '@/api/payment'
import { PaymentButton, PaymentCard, PaymentRow, PaymentShell } from '@/components/payment/payment-shell'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourse } from '@/hooks/queries'
import { getCheckoutTotals } from '@/lib/checkout-totals'
import { getCoursePrice } from '@/lib/course-meta'
import { formatUsd } from '@/lib/payment-demo'
import { isStripeNativeSupported, stripeUnavailableReason } from '@/lib/stripe-available'
import { invalidateAfterPurchase } from '@/lib/stripe-checkout'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'

export default function PaymentMethodScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const locale = useLocale()
	const { courseId = '' } = useLocalSearchParams<{ courseId: string }>()
	const { data: course } = useCourse(courseId)
	const { initPaymentSheet, presentPaymentSheet } = useStripe()
	const price = getCoursePrice(course)
	const totals = getCheckoutTotals(price)
	const [paying, setPaying] = useState(false)

	const pay = async () => {
		if (!isStripeNativeSupported()) {
			Alert.alert(t('payment.paymentFailed'), stripeUnavailableReason(t))
			return
		}
		setPaying(true)
		try {
			const sheet = await getPaymentSheetParams(courseId)

			// Bepul kurs
			if (sheet.free) {
				await invalidateAfterPurchase(courseId)
				router.replace({ pathname: '/payment/transaction', params: { courseId, amount: '0' } })
				return
			}

			// PaymentSheet ni ishga tushirish
			const { error: initError } = await initPaymentSheet({
				merchantDisplayName: 'EduPanda',
				customerId: sheet.customerId,
				customerEphemeralKeySecret: sheet.ephemeralKey,
				paymentIntentClientSecret: sheet.clientSecret,
				allowsDelayedPaymentMethods: false,
				appearance: {
					colors: {
						primary: theme.accent,
						background: theme.background,
						componentBackground: theme.surface,
						componentText: theme.heading,
						primaryText: theme.heading,
						secondaryText: theme.textMuted,
					},
				},
			})

			if (initError) throw new Error(initError.message)

			// Stripe UI ni ko'rsatish
			const { error: presentError } = await presentPaymentSheet()

			if (presentError) {
				// Foydalanuvchi o'zi yopdi — xato emas
				if (presentError.code === 'Canceled') return
				throw new Error(presentError.message)
			}

			// To'lov muvaffaqiyatli — backend da tasdiqlash
			await confirmCheckout(courseId, sheet.paymentIntentId)
			await invalidateAfterPurchase(courseId)
			router.replace({
				pathname: '/payment/transaction',
				params: { courseId, amount: String(sheet.totals.totalUsd) },
			})
		} catch (err) {
			Alert.alert(t('payment.paymentFailed'), (err as Error).message)
		} finally {
			setPaying(false)
		}
	}

	return (
		<PaymentShell
			title={t('payment.paymentMethod')}
			footer={
				paying ? (
					<ActivityIndicator color={theme.accent} />
				) : (
					<PaymentButton
						title={t('payment.payNow', { price: formatUsd(totals.total) })}
						onPress={() => void pay()}
					/>
				)
			}>

			<View style={[styles.hero, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name="shield-checkmark-outline" size={40} color={theme.accent} />
				<AppText variant="small" style={[styles.heroText, { color: theme.textMuted }]}>
					{t('payment.secureHint')}
				</AppText>
			</View>

			{course ? (
				<AppText variant="bodyStrong" style={[styles.courseTitle, { color: theme.heading }]}>
					{tText(course.title, locale)}
				</AppText>
			) : null}

			<PaymentCard>
				<PaymentRow label={t('payment.subtotal')} value={formatUsd(totals.subtotal)} />
				<PaymentRow label={t('payment.tax')} value={formatUsd(totals.tax)} />
				<PaymentRow label={t('payment.total')} value={formatUsd(totals.total)} bold />
			</PaymentCard>

			<View style={styles.infoRow}>
				<Ionicons name="card-outline" size={18} color={theme.textMuted} />
				<AppText variant="small" style={{ color: theme.textMuted, flex: 1 }}>
					{t('payment.stripeInfo')}
				</AppText>
			</View>
		</PaymentShell>
	)
}

const styles = StyleSheet.create({
	hero: {
		borderRadius: 14,
		paddingVertical: spacing['2xl'],
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	heroText: { textAlign: 'center' },
	courseTitle: {
		marginBottom: spacing.md,
		fontWeight: '700',
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.sm,
		marginTop: spacing.md,
		paddingHorizontal: spacing.sm,
	},
})
