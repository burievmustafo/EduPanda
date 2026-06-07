import { CardField, useStripe } from '@stripe/stripe-react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, StyleSheet, TextInput, View } from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { attachPaymentCard } from '@/api/payment'
import {
	ProfileInfoCard,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { isStripeNativeSupported, stripeUnavailableReason } from '@/lib/stripe-available'
import { PaymentButton } from '@/components/payment/payment-shell'

export default function AddCardScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { createPaymentMethod } = useStripe()
	const queryClient = useQueryClient()
	const [name, setName] = useState('')
	const [cardComplete, setCardComplete] = useState(false)

	const save = useMutation({
		mutationFn: async () => {
			if (!isStripeNativeSupported() || !createPaymentMethod) {
				throw new Error(stripeUnavailableReason(t))
			}
			const { paymentMethod, error } = await createPaymentMethod({
				paymentMethodType: 'Card',
				paymentMethodData: {
					billingDetails: { name: name.trim() || undefined },
				},
			})
			if (error || !paymentMethod) {
				throw new Error(error?.message ?? t('payment.cardError'))
			}
			await attachPaymentCard(paymentMethod.id)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['paymentCards'] })
			router.back()
		},
		onError: (err: Error) => {
			Alert.alert(t('payment.paymentFailed'), err.message)
		},
	})

	return (
		<ProfileSubpage title={t('payment.addCard')}>
			<ProfileInfoCard>
				<AppText variant="body" style={{ color: theme.textMuted, marginBottom: spacing.md }}>
					{t('payment.addCardHint')}
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
					<View style={styles.cardFieldWrap}>
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
					</View>
				) : (
					<AppText variant="body" style={{ color: theme.textMuted }}>
						{stripeUnavailableReason(t)}
					</AppText>
				)}
			</ProfileInfoCard>

			{save.isPending ? (
				<ActivityIndicator color={theme.accent} />
			) : (
				<PaymentButton
					title={t('payment.saveCard')}
					onPress={() => {
						if (cardComplete) save.mutate()
					}}
					loading={save.isPending}
				/>
			)}
		</ProfileSubpage>
	)
}

const styles = StyleSheet.create({
	label: { fontWeight: '700', marginBottom: spacing.xs },
	input: {
		minHeight: 48,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: spacing.md,
		fontSize: 14,
		marginBottom: spacing.md,
	},
	cardFieldWrap: { marginTop: spacing.sm },
	cardField: { width: '100%', height: 50 },
})
