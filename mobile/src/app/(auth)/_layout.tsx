import { Stack } from 'expo-router'

import { figmaAuth } from '@/constants/figma-auth-theme'

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: figmaAuth.white },
				animation: 'fade',
			}}
		/>
	)
}
