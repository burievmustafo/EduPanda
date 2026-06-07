import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { figmaAuth } from '@/constants/figma-auth-theme'

export default function AppEntry() {
	const { isLoaded, isSignedIn } = useAuth()

	// Clerk sessiyani yuklaguncha kutamiz (token cache'dan tiklanadi).
	if (!isLoaded) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" color={figmaAuth.primaryButtonText} />
			</View>
		)
	}

	if (isSignedIn) {
		return <Redirect href="/(tabs)/home" />
	}

	return <Redirect href="/(auth)/splash" />
}

const styles = StyleSheet.create({
	loading: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: figmaAuth.splashBg,
	},
})
