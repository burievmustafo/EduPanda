import { router } from 'expo-router'
import { useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { figmaAuth } from '@/constants/figma-auth-theme'
import { useAuthFlow } from '@/store/auth-flow-store'

const SPLASH_MS = 2200

export default function SplashScreen() {
	const insets = useSafeAreaInsets()
	const { hasCompletedOnboarding, isSignedIn, hydrated } = useAuthFlow()

	useEffect(() => {
		if (!hydrated) return

		const timer = setTimeout(() => {
			if (isSignedIn) {
				router.replace('/(tabs)/home')
				return
			}
			if (hasCompletedOnboarding) {
				router.replace('/(auth)/option')
				return
			}
			router.replace('/(auth)/onboarding/1')
		}, SPLASH_MS)

		return () => clearTimeout(timer)
	}, [hydrated, hasCompletedOnboarding, isSignedIn])

	return (
		<View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
			<View style={styles.center}>
				<Image
					source={require('../../../assets/images/auth/splash-cap.png')}
					style={styles.cap}
					resizeMode="contain"
					accessibilityIgnoresInvertColors
				/>
				<Image
					source={require('../../../assets/images/auth/splash-logo.png')}
					style={styles.logo}
					resizeMode="contain"
					accessibilityIgnoresInvertColors
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: figmaAuth.splashBg,
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 24,
	},
	cap: {
		width: 168,
		height: 108,
	},
	logo: {
		width: 280,
		height: 59,
	},
})
