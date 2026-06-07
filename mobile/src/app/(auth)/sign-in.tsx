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
	Text,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AuthDivider } from '@/components/auth/auth-divider'
import { AuthTextField } from '@/components/auth/auth-text-field'
import { FigmaPrimaryButton } from '@/components/auth/figma-primary-button'
import { SocialAuthButton } from '@/components/auth/social-auth-button'
import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'
import { clerkErrorMessage } from '@/lib/clerk-error'
import { isValidEmail } from '@/lib/email'
import { useSocialAuth, type SocialStrategy } from '@/lib/social-auth'
import { useSignIn } from '@clerk/clerk-expo'

export default function SignInScreen() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const { signIn, setActive, isLoaded } = useSignIn()
	const socialAuth = useSocialAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [socialLoading, setSocialLoading] = useState<SocialStrategy | null>(null)

	const onSubmit = async () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert(t('auth.signIn'), t('auth.fillAllFields'))
			return
		}
		if (!isValidEmail(email)) {
			Alert.alert(t('auth.signIn'), t('auth.invalidEmail'))
			return
		}
		if (!isLoaded || !signIn) return
		setLoading(true)
		try {
			const attempt = await signIn.create({
				identifier: email.trim(),
				password,
			})
			if (attempt.status === 'complete') {
				await setActive({ session: attempt.createdSessionId })
				router.replace('/(tabs)/home')
			} else {
				Alert.alert(t('auth.signIn'), 'Additional verification is required.')
			}
		} catch (err) {
			Alert.alert(t('auth.signIn'), clerkErrorMessage(err))
		} finally {
			setLoading(false)
		}
	}

	const onSocial = async (strategy: SocialStrategy, label: string) => {
		if (socialLoading) return
		setSocialLoading(strategy)
		try {
			const done = await socialAuth(strategy)
			if (done) {
				router.replace('/(tabs)/home')
				return
			}
			Alert.alert(label, t('auth.oauthCancelled'))
		} catch (err) {
			Alert.alert(label, clerkErrorMessage(err))
		} finally {
			setSocialLoading(null)
		}
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
						{t('auth.signInTitle')}
					</AppText>
					<AppText variant="body" style={styles.subtitle}>
						{t('auth.signInSubtitle')}
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
						<AuthTextField
							label={t('auth.passwordLabel')}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoComplete="password"
							placeholder="••••••••"
						/>
						<Pressable
							onPress={() => router.push('/(auth)/reset-password')}
							style={styles.forgot}
							accessibilityRole="link">
							<AppText variant="small" style={styles.forgotText}>
								{t('auth.forgotPassword')}
							</AppText>
						</Pressable>

						<FigmaPrimaryButton
							title={t('auth.signIn')}
							onPress={onSubmit}
							loading={loading}
							style={styles.submit}
						/>
					</View>

					<AuthDivider />

					<SocialAuthButton
						variant="google"
						title={t('auth.signInGoogle')}
						onPress={() => void onSocial('oauth_google', 'Google')}
						loading={socialLoading === 'oauth_google'}
						disabled={socialLoading !== null}
					/>
					<View style={styles.socialGap} />
					<SocialAuthButton
						variant="facebook"
						title={t('auth.signInFacebook')}
						onPress={() => void onSocial('oauth_facebook', 'Facebook')}
						loading={socialLoading === 'oauth_facebook'}
						disabled={socialLoading !== null}
					/>

					<Pressable
						onPress={() => router.push('/(auth)/sign-up')}
						style={styles.footer}
						accessibilityRole="link">
						<Text style={styles.footerText}>
							{t('auth.noAccount')}{' '}
							<Text style={styles.footerLink}>{t('auth.signUpHere')}</Text>
						</Text>
					</Pressable>
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
		paddingBottom: spacing['3xl'],
	},
	title: {
		color: figmaAuth.heading,
		textAlign: 'center',
		letterSpacing: 1.6,
		marginTop: spacing.sm,
	},
	subtitle: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		marginTop: spacing.lg,
		paddingHorizontal: spacing.md,
	},
	form: {
		marginTop: spacing['2xl'],
		gap: spacing.lg,
	},
	forgot: {
		alignSelf: 'flex-end',
	},
	forgotText: {
		color: figmaAuth.textMuted,
	},
	submit: {
		marginTop: spacing.sm,
	},
	socialGap: { height: spacing.sm },
	footer: {
		marginTop: spacing['2xl'],
		alignItems: 'center',
	},
	footerText: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		fontSize: 12,
	},
	footerLink: {
		color: figmaAuth.heading,
		fontWeight: '700',
		textDecorationLine: 'underline',
		fontSize: 12,
	},
})
