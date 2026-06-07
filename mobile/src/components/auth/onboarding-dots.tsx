import { StyleSheet, View } from 'react-native'

import { figmaAuth } from '@/constants/figma-auth-theme'

type Props = {
	total: number
	activeIndex: number
}

export function OnboardingDots({ total, activeIndex }: Props) {
	return (
		<View style={styles.row} accessibilityRole="tablist">
			{Array.from({ length: total }, (_, i) => (
				<View
					key={i}
					style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
					accessibilityRole="tab"
					accessibilityState={{ selected: i === activeIndex }}
				/>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	dotActive: {
		width: 24,
		backgroundColor: figmaAuth.primaryButton,
	},
	dotInactive: {
		backgroundColor: '#D3D3D3',
	},
})
