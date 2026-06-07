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
import { useSocialAuth, type SocialStrategy } from '@/lib/social-auth'
import { useSignUp } from '@clerk/clerk-expo'

export default function SignUpScreen() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const { signUp, setActive, isLoaded } = useSignUp()
	const socialAuth = useSocialAuth()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [pendingVerification, setPendingVerification] = useState(false)
	const [code, setCode] = useState('')
	const [socialLoading, setSocialLoading] = useState<SocialStrategy | null>(null)

	const onSubmit = async () => {
		if (!name.trim() || !email.trim() || !password.trim()) {
			Alert.alert(t('auth.signUp'), t('auth.fillAllFields'))
			return
		}
		if (!isLoaded || !signUp) return
		setLoading(true)
		try {
			await signUp.create({
				emailAddress: email.trim(),
				password,
				firstName: name.trim(),
			})
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
			setPendingVerification(true)
		} catch (err) {
			Alert.alert(t('auth.signUp'), clerkErrorMessage(err))
		} finally {
			setLoading(false)
		}
	}

	const onVerify = async () => {
		if (!code.trim()) {
			Alert.alert(t('auth.signUp'), t('auth.fillAllFields'))
			return
		}
		if (!isLoaded || !signUp) return
		setLoading(true)
		try {
			const attempt = await signUp.attemptEmailAddressVerification({
				code: code.trim(),
			})
			if (attempt.status === 'complete') {
				await setActive({ session: attempt.createdSessionId })
				router.replace('/(tabs)/home')
			} else {
				Alert.alert(t('auth.signUp'), 'Invalid code, please try again.')
			}
		} catch (err) {
			Alert.alert(t('auth.signUp'), clerkErrorMessage(err))
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
				// Ro'yxatdan o'tish/login bo'ldi — ClerkBridge /me dan rolni sinxronlaydi.
				router.replace('/(tabs)/home')
			}
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
						{pendingVerification ? 'Verify your email' : t('auth.signUpTitle')}
					</AppText>
					<AppText variant="body" style={styles.subtitle}>
						{pendingVerification
							? 'Enter the 6-digit code we sent to your email.'
							: t('auth.signUpSubtitle')}
					</AppText>

					{pendingVerification ? (
						<View style={styles.form}>
							<AuthTextField
								label="Verification code"
								value={code}
								onChangeText={setCode}
								keyboardType="number-pad"
								autoComplete="one-time-code"
								placeholder="123456"
							/>
							<FigmaPrimaryButton
								title="Verify"
								onPress={() => void onVerify()}
								loading={loading}
								style={styles.submit}
							/>
						</View>
					) : (
					<>
					<View style={styles.form}>
						<AuthTextField
							label={t('auth.nameLabel')}
							value={name}
							onChangeText={setName}
							autoComplete="name"
							placeholder={t('auth.namePlaceholder')}
						/>
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
							autoComplete="new-password"
							placeholder="••••••••"
						/>

						<FigmaPrimaryButton
							title={t('auth.signUp')}
							onPress={() => void onSubmit()}
							loading={loading}
							style={styles.submit}
						/>
					</View>

					<AuthDivider labelKey="auth.orSignUpWith" />

					<SocialAuthButton
						variant="google"
						title={t('auth.signUpGoogle')}
						onPress={() => void onSocial('oauth_google', 'Google')}
						loading={socialLoading === 'oauth_google'}
						disabled={socialLoading !== null}
					/>
					<View style={styles.socialGap} />
					<SocialAuthButton
						variant="facebook"
						title={t('auth.signUpFacebook')}
						onPress={() => void onSocial('oauth_facebook', 'Facebook')}
						loading={socialLoading === 'oauth_facebook'}
						disabled={socialLoading !== null}
					/>

					<Pressable
						onPress={() => router.push('/(auth)/sign-in')}
						style={styles.footer}
						accessibilityRole="link">
						<Text style={styles.footerText}>
							{t('auth.haveAccount')}{' '}
							<Text style={styles.footerLink}>{t('auth.signInHere')}</Text>
						</Text>
					</Pressable>
					</>
					)}
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
	},
	subtitle: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		marginTop: spacing.lg,
	},
	form: {
		marginTop: spacing['2xl'],
		gap: spacing.lg,
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
