import { CardField, useStripe } from '@stripe/stripe-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, StyleSheet, TextInput, View } from 'react-native'

import { attachPaymentCard } from '@/api/payment'
import { PaymentButton, PaymentCard, PaymentRow, PaymentShell } from '@/components/payment/payment-shell'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourse } from '@/hooks/queries'
import { getCheckoutTotals } from '@/lib/checkout-totals'
import { getCoursePrice } from '@/lib/course-meta'
import { formatUsd } from '@/lib/payment-demo'
import { isStripeNativeSupported, stripeUnavailableReason } from '@/lib/stripe-available'
import { completeStripePayment } from '@/lib/stripe-checkout'

export default function PaymentDetailsScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { courseId = '' } = useLocalSearchParams<{ courseId: string }>()
	const { data: course } = useCourse(courseId)
	const { createPaymentMethod, confirmPayment } = useStripe()
	const price = getCoursePrice(course)
	const totals = getCheckoutTotals(price)
	const [name, setName] = useState('')
	const [cardComplete, setCardComplete] = useState(false)
	const [loading, setLoading] = useState(false)

	const pay = async () => {
		if (!isStripeNativeSupported() || !createPaymentMethod || !confirmPayment) {
			Alert.alert(t('payment.paymentFailed'), stripeUnavailableReason(t))
			return
		}
		setLoading(true)
		try {
			const { paymentMethod, error } = await createPaymentMethod({
				paymentMethodType: 'Card',
				paymentMethodData: {
					billingDetails: { name: name.trim() || undefined },
				},
			})
			if (error || !paymentMethod) {
				throw new Error(error?.message ?? t('payment.cardError'))
			}
			try {
				await attachPaymentCard(paymentMethod.id)
			} catch {
				// Profilga saqlanmasa ham to'lov davom etadi
			}
			await completeStripePayment(confirmPayment, courseId, paymentMethod.id)
			router.replace({
				pathname: '/payment/transaction',
				params: { courseId, amount: String(totals.total) },
			})
		} catch (err) {
			Alert.alert(t('payment.paymentFailed'), (err as Error).message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<PaymentShell
			title={t('payment.paymentDetails')}
			footer={
				loading ? (
					<ActivityIndicator color={theme.accent} />
				) : (
					<PaymentButton
						title={t('payment.payNow', { price: formatUsd(totals.total) })}
						onPress={() => {
							if (cardComplete) void pay()
						}}
						loading={loading}
					/>
				)
			}>
			<PaymentCard>
				<PaymentRow label={t('payment.subtotal')} value={formatUsd(totals.subtotal)} />
				<PaymentRow label={t('payment.tax')} value={formatUsd(totals.tax)} />
				<PaymentRow label={t('payment.total')} value={formatUsd(totals.total)} bold />
			</PaymentCard>

			<PaymentCard>
				<AppText variant="bodyStrong" style={[styles.sectionTitle, { color: theme.heading }]}>
					{t('payment.cardInformation')}
				</AppText>
				<AppText variant="small" style={[styles.label, { color: theme.heading }]}>
					{t('payment.nameOnCard')}
				</AppText>
				<TextInput
					value={name}
					onChangeText={setName}
					style={[
						styles.input,
						{ borderColor: theme.progressTrack, color: theme.heading, backgroundColor: theme.background },
					]}
					placeholderTextColor={theme.textMuted}
				/>
				{isStripeNativeSupported() ? (
					<CardField
						postalCodeEnabled={false}
						onCardChange={(details) => setCardComplete(details.complete)}
						cardStyle={{
							textColor: theme.heading,
							placeholderColor: theme.textMuted,
							backgroundColor: theme.background,
						}}
						style={styles.cardField}
					/>
				) : (
					<AppText variant="body" style={{ color: theme.textMuted, marginBottom: spacing.md }}>
						{stripeUnavailableReason(t)}
					</AppText>
				)}
				<AppText variant="small" style={[styles.secure, { color: theme.textMuted }]}>
					{t('payment.secureHint')}
				</AppText>
			</PaymentCard>
		</PaymentShell>
	)
}

const styles = StyleSheet.create({
	sectionTitle: { marginBottom: spacing.md },
	label: { fontWeight: '700', marginBottom: spacing.xs },
	input: {
		minHeight: 48,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: spacing.md,
		fontSize: 14,
		marginBottom: spacing.md,
	},
	cardField: { width: '100%', height: 50, marginBottom: spacing.sm },
	secure: { textAlign: 'center', marginTop: spacing.xs },
})
