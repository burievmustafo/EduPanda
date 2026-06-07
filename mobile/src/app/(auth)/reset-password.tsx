import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AuthTextField } from '@/components/auth/auth-text-field'
import { FigmaPrimaryButton } from '@/components/auth/figma-primary-button'
import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'

export default function ResetPasswordScreen() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const [email, setEmail] = useState('')

	const onSubmit = () => {
		if (!email.trim()) {
			Alert.alert(t('auth.resetTitle'), t('auth.fillAllFields'))
			return
		}
		Alert.alert(t('auth.resetTitle'), t('auth.resetSent'), [
			{ text: 'OK', onPress: () => router.back() },
		])
	}

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
				<Pressable
					onPress={() => router.back()}
					style={styles.back}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={t('common.back')}>
					<Ionicons name="arrow-back" size={24} color={figmaAuth.heading} />
				</Pressable>

				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}>
					<AppText variant="h2" style={styles.title}>
						{t('auth.resetTitle')}
					</AppText>
					<AppText variant="body" style={styles.subtitle}>
						{t('auth.resetSubtitle')}
					</AppText>

					<View style={styles.form}>
						<AuthTextField
							label={t('auth.emailLabel')}
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
							placeholder="youremail@gmail.com"
						/>

						<FigmaPrimaryButton
							title={t('auth.resetSubmit')}
							onPress={onSubmit}
							style={styles.submit}
						/>
					</View>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	flex: { flex: 1 },
	screen: {
		flex: 1,
		backgroundColor: figmaAuth.white,
	},
	back: {
		paddingHorizontal: 17,
		paddingVertical: spacing.sm,
		alignSelf: 'flex-start',
	},
	scroll: {
		paddingHorizontal: 22,
		paddingTop: spacing['3xl'],
		paddingBottom: spacing['3xl'],
	},
	title: {
		color: figmaAuth.heading,
		textAlign: 'center',
		letterSpacing: 1.6,
	},
	subtitle: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		marginTop: spacing.lg,
		paddingHorizontal: spacing.md,
	},
	form: {
		marginTop: spacing['3xl'],
		gap: spacing['2xl'],
	},
	submit: {
		marginTop: spacing.lg,
	},
})
