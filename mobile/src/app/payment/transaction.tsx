import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { PaymentButton, PaymentCard, PaymentRow, PaymentShell } from '@/components/payment/payment-shell'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { formatUsd } from '@/lib/payment-demo'

export default function TransactionScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { courseId = '', amount = '0' } = useLocalSearchParams<{
		courseId: string
		amount?: string
	}>()
	const paid = Number(amount) || 0

	return (
		<PaymentShell title={t('payment.transaction')}>
			<View style={[styles.successIcon, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name="checkmark-circle" size={72} color={theme.accent} />
			</View>
			<AppText variant="h2" style={[styles.title, { color: theme.heading }]}>
				{t('payment.transactionCompleted')}
			</AppText>
			<AppText variant="body" style={[styles.desc, { color: theme.textMuted }]}>
				{t('payment.transactionDesc')}
			</AppText>

			<PaymentCard>
				<PaymentRow label={t('payment.amountPaid')} value={formatUsd(paid)} />
				<PaymentRow label={t('payment.status')} value={t('payment.successful')} bold />
			</PaymentCard>

			<PaymentButton
				title={t('payment.goToCourse')}
				onPress={() =>
					router.replace({ pathname: '/course/[courseId]', params: { courseId } })
				}
			/>
		</PaymentShell>
	)
}

const styles = StyleSheet.create({
	successIcon: {
		width: 130,
		height: 130,
		borderRadius: 65,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		marginTop: spacing['3xl'],
		marginBottom: spacing.lg,
	},
	title: { textAlign: 'center', fontWeight: '800' },
	desc: { textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl, lineHeight: 22 },
})
