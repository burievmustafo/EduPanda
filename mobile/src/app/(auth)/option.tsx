import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { FigmaOutlineButton } from '@/components/auth/figma-outline-button'
import { FigmaPrimaryButton } from '@/components/auth/figma-primary-button'
import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'

export default function OptionScreen() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()

	return (
		<View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
				bounces={false}>
				<Image
					source={require('../../../assets/images/auth/option-illustration.png')}
					style={styles.illustration}
					resizeMode="contain"
					accessibilityIgnoresInvertColors
				/>

				<AppText variant="h2" style={styles.title}>
					{t('auth.optionTitle')}
				</AppText>
				<AppText variant="body" style={styles.description}>
					{t('auth.optionDesc')}
				</AppText>

				<View style={styles.actions}>
					<FigmaPrimaryButton
						title={t('auth.signIn')}
						fullWidth={false}
						style={styles.halfBtn}
						onPress={() => router.push('/(auth)/sign-in')}
					/>
					<FigmaOutlineButton
						title={t('auth.signUp')}
						style={styles.halfBtn}
						onPress={() => router.push('/(auth)/sign-up')}
					/>
				</View>

				<Pressable
					onPress={() => router.push('/dev-roles')}
					style={styles.devLink}
					accessibilityRole="link">
					<AppText variant="small" style={styles.devText}>
						{t('auth.teacherParentAccess')}
					</AppText>
				</Pressable>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: figmaAuth.white,
	},
	scroll: {
		paddingHorizontal: 22,
		paddingBottom: spacing['2xl'],
		alignItems: 'center',
	},
	illustration: {
		width: '92%',
		maxWidth: 340,
		height: 340,
		marginTop: spacing.md,
		alignSelf: 'center',
	},
	title: {
		color: figmaAuth.heading,
		textAlign: 'center',
		letterSpacing: 1.6,
		marginTop: spacing.xl,
	},
	description: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		marginTop: spacing.lg,
		paddingHorizontal: spacing.sm,
	},
	actions: {
		flexDirection: 'row',
		gap: 8,
		width: '100%',
		marginTop: spacing['3xl'],
	},
	halfBtn: {
		flex: 1,
		minWidth: 0,
	},
	devLink: {
		marginTop: spacing['3xl'],
		padding: spacing.sm,
	},
	devText: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		textDecorationLine: 'underline',
	},
})
