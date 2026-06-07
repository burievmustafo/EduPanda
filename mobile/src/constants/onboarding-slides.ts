import type { ImageSourcePropType } from 'react-native'

export type OnboardingSlide = {
	step: number
	titleKey: string
	descriptionKey: string
	illustration: ImageSourcePropType
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
	{
		step: 1,
		titleKey: 'auth.onboarding1Title',
		descriptionKey: 'auth.onboarding1Desc',
		illustration: require('../../assets/images/auth/onboarding-1.png'),
	},
	{
		step: 2,
		titleKey: 'auth.onboarding2Title',
		descriptionKey: 'auth.onboarding2Desc',
		illustration: require('../../assets/images/auth/onboarding-2.png'),
	},
	{
		step: 3,
		titleKey: 'auth.onboarding3Title',
		descriptionKey: 'auth.onboarding3Desc',
		illustration: require('../../assets/images/auth/onboarding-3.png'),
	},
	{
		step: 4,
		titleKey: 'auth.onboarding4Title',
		descriptionKey: 'auth.onboarding4Desc',
		illustration: require('../../assets/images/auth/onboarding-4.png'),
	},
]
