import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'

import { startCheckout } from '@/api/payment'
import { PaymentButton, PaymentCard, PaymentRow, PaymentShell } from '@/components/payment/payment-shell'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourse, useSections } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { getCheckoutTotals } from '@/lib/checkout-totals'
import { getCourseDurationLabel, getCoursePrice, getCoursePriceLabel } from '@/lib/course-meta'
import { formatUsd } from '@/lib/payment-demo'
import { invalidateAfterPurchase } from '@/lib/stripe-checkout'
import { tText } from '@/lib/localized'

export default function PaymentOverviewScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const locale = useLocale()
	const { courseId = '' } = useLocalSearchParams<{ courseId: string }>()
	const { data: course } = useCourse(courseId)
	const { data: sections } = useSections(courseId)
	const priceLabel = getCoursePriceLabel(course)
	const price = getCoursePrice(course)
	const totals = getCheckoutTotals(price)
	const [loading, setLoading] = useState(false)
	const isFree = price <= 0

	const continueFlow = async () => {
		if (!isFree) {
			router.push({ pathname: '/payment/method', params: { courseId } })
			return
		}
		setLoading(true)
		try {
			await startCheckout(courseId)
			await invalidateAfterPurchase(courseId)
			router.replace({ pathname: '/course/[courseId]', params: { courseId } })
		} catch (err) {
			Alert.alert(t('payment.paymentFailed'), (err as Error).message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<PaymentShell
			title={t('payment.overview')}
			footer={
				loading ? (
					<ActivityIndicator color={theme.accent} />
				) : (
					<PaymentButton
						title={
							isFree
								? t('payment.enrollFree')
								: t('payment.continueToPayment')
						}
						onPress={() => void continueFlow()}
					/>
				)
			}>
			<View style={[styles.hero, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name="school-outline" size={42} color={theme.accent} />
			</View>

			<AppText variant="h2" style={[styles.courseTitle, { color: theme.heading }]}>
				{course ? tText(course.title, locale) : t('payment.course')}
			</AppText>
			<AppText variant="body" style={[styles.subtitle, { color: theme.textMuted }]}>
				{course?.instructor.fullName ?? 'EduPanda'}
			</AppText>

			<PaymentCard>
				<PaymentRow label={t('payment.coursePrice')} value={priceLabel.current} />
				{!isFree ? (
					<>
						<PaymentRow label={t('payment.tax')} value={formatUsd(totals.tax)} />
						<PaymentRow label={t('payment.total')} value={formatUsd(totals.total)} bold />
					</>
				) : (
					<PaymentRow label={t('payment.total')} value={priceLabel.current} bold />
				)}
				<PaymentRow
					label={t('payment.duration')}
					value={sections ? getCourseDurationLabel(sections) : '—'}
				/>
			</PaymentCard>

			<PaymentCard>
				<AppText variant="bodyStrong" style={{ color: theme.heading }}>
					{t('payment.included')}
				</AppText>
				<View style={styles.feature}>
					<Ionicons name="play-circle-outline" size={19} color={theme.accent} />
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{course?.lessonsCount ?? 0}+ {t('course.lessons')}
					</AppText>
				</View>
				<View style={styles.feature}>
					<Ionicons name="ribbon-outline" size={19} color={theme.accent} />
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{t('payment.certificateIncluded')}
					</AppText>
				</View>
			</PaymentCard>
		</PaymentShell>
	)
}

const styles = StyleSheet.create({
	hero: {
		height: 150,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.lg,
	},
	courseTitle: { fontWeight: '800' },
	subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
	feature: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginTop: spacing.md,
	},
})
