import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { FigmaPrimaryButton } from '@/components/auth/figma-primary-button'
import { OnboardingDots } from '@/components/auth/onboarding-dots'
import { AppText } from '@/components/ui/app-text'
import type { OnboardingSlide } from '@/constants/onboarding-slides'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'
import { useAuthFlow } from '@/store/auth-flow-store'

type Props = {
	slide: OnboardingSlide
}

export function OnboardingLayout({ slide }: Props) {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const completeOnboarding = useAuthFlow((s) => s.completeOnboarding)
	const index = slide.step - 1
	const isLast = slide.step === 4

	const goNext = () => {
		if (isLast) {
			void completeOnboarding().then(() => router.replace('/(auth)/option'))
			return
		}
		router.push(`/(auth)/onboarding/${slide.step + 1}`)
	}

	const skip = () => {
		void completeOnboarding().then(() => router.replace('/(auth)/option'))
	}

	return (
		<View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
				bounces={false}>
				<View style={styles.illustrationWrap}>
					<Image
						source={slide.illustration}
						style={styles.illustration}
						resizeMode="contain"
						accessibilityIgnoresInvertColors
					/>
				</View>

				<AppText variant="h2" style={styles.title}>
					{t(slide.titleKey)}
				</AppText>
				<AppText variant="body" style={styles.description}>
					{t(slide.descriptionKey)}
				</AppText>

				<OnboardingDots total={4} activeIndex={index} />

				<FigmaPrimaryButton
					title={t('common.continue')}
					onPress={goNext}
					style={styles.continueBtn}
				/>

				<Pressable onPress={skip} hitSlop={12} accessibilityRole="button">
					<AppText variant="caption" style={styles.skip}>
						{t('common.skip')}
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
	illustrationWrap: {
		width: '100%',
		minHeight: 260,
		height: 300,
		marginTop: spacing.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	illustration: {
		width: '92%',
		height: '100%',
		maxWidth: 340,
	},
	title: {
		color: figmaAuth.heading,
		textAlign: 'center',
		letterSpacing: 1.6,
		marginTop: spacing['2xl'],
	},
	description: {
		color: figmaAuth.textMuted,
		textAlign: 'center',
		marginTop: spacing.lg,
		paddingHorizontal: spacing.sm,
	},
	continueBtn: {
		width: 225,
		marginTop: spacing['3xl'],
	},
	skip: {
		color: figmaAuth.textMuted,
		textDecorationLine: 'underline',
		textTransform: 'uppercase',
		marginTop: spacing.lg,
	},
})
