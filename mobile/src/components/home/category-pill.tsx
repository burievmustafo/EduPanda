import { Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'

type Props = {
	label: string
	selected?: boolean
	onPress?: () => void
}

export function CategoryPill({ label, selected, onPress }: Props) {
	const theme = useFigmaTheme()

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.chip,
				{
					backgroundColor: theme.surface,
					borderColor: selected ? theme.accent : theme.progressTrack,
				},
				pressed && styles.pressed,
			]}
			accessibilityRole="button"
			accessibilityState={{ selected: !!selected }}>
			<AppText
				variant="captionStrong"
				style={[styles.label, { color: selected ? theme.accent : theme.heading }]}>
				{label}
			</AppText>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	chip: {
		height: 33,
		paddingHorizontal: 12,
		borderRadius: 19,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressed: { opacity: 0.88 },
	label: {
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 0.57,
	},
})
