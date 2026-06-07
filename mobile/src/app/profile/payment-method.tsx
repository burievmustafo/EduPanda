import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	View,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deletePaymentCard } from '@/api/payment'
import {
	ProfileInfoCard,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { usePaymentCards } from '@/hooks/queries'
import { formatCardLabel } from '@/lib/stripe-checkout'

export default function PaymentMethodScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { data: cards, isLoading, isError } = usePaymentCards()
	const queryClient = useQueryClient()

	const remove = useMutation({
		mutationFn: (id: string) => deletePaymentCard(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['paymentCards'] })
		},
		onError: (err: Error) => {
			Alert.alert(t('payment.paymentFailed'), err.message)
		},
	})

	const confirmRemove = (id: string, label: string) => {
		Alert.alert(t('payment.removeCard'), label, [
			{ text: t('payment.cancel'), style: 'cancel' },
			{
				text: t('payment.remove'),
				style: 'destructive',
				onPress: () => remove.mutate(id),
			},
		])
	}

	return (
		<ProfileSubpage title={t('profile.paymentMethod')}>
			<Pressable onPress={() => router.push('/profile/add-card')}>
				<ProfileInfoCard>
					<View style={styles.row}>
						<View style={[styles.iconWrap, { backgroundColor: theme.notificationCardBg }]}>
							<Ionicons name="add-circle-outline" size={24} color={theme.accent} />
						</View>
						<View style={styles.body}>
							<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]}>
								{t('payment.addCard')}
							</AppText>
							<AppText variant="small" style={[styles.desc, { color: theme.textMuted }]}>
								{t('payment.savedCardsHint')}
							</AppText>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
					</View>
				</ProfileInfoCard>
			</Pressable>

			{isLoading ? (
				<ActivityIndicator color={theme.accent} style={styles.loader} />
			) : isError ? (
				<AppText variant="body" style={{ color: theme.textMuted }}>
					{t('payment.cardsLoadError')}
				</AppText>
			) : (cards ?? []).length === 0 ? (
				<AppText variant="body" style={{ color: theme.textMuted }}>
					{t('payment.noSavedCards')}
				</AppText>
			) : (
				<View style={styles.methods}>
					{(cards ?? []).map((card) => (
						<ProfileInfoCard key={card.id}>
							<View style={styles.row}>
								<View style={[styles.methodIcon, { backgroundColor: theme.notificationCardBg }]}>
									<Ionicons name="card-outline" size={22} color={theme.accent} />
								</View>
								<View style={styles.body}>
									<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]}>
										{formatCardLabel(card)}
									</AppText>
									{card.name ? (
										<AppText variant="small" style={[styles.desc, { color: theme.textMuted }]}>
											{card.name}
										</AppText>
									) : null}
								</View>
								<Pressable
									onPress={() => confirmRemove(card.id, formatCardLabel(card))}
									hitSlop={12}>
									<Ionicons name="trash-outline" size={22} color={theme.textMuted} />
								</Pressable>
							</View>
						</ProfileInfoCard>
					))}
				</View>
			)}
		</ProfileSubpage>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconWrap: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	methods: {
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	methodIcon: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	body: { flex: 1 },
	title: {},
	desc: { marginTop: 2 },
	loader: { marginTop: spacing.lg },
})
