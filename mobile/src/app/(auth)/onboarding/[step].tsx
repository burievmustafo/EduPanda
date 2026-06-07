import { Redirect, useLocalSearchParams } from 'expo-router'

import { OnboardingLayout } from '@/components/auth/onboarding-layout'
import { ONBOARDING_SLIDES } from '@/constants/onboarding-slides'

export default function OnboardingStepScreen() {
	const { step } = useLocalSearchParams<{ step: string }>()
	const stepNum = Number(step)
	const slide = ONBOARDING_SLIDES.find((s) => s.step === stepNum)

	if (!slide) {
		return <Redirect href="/(auth)/onboarding/1" />
	}

	return <OnboardingLayout slide={slide} />
}
