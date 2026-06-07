import { StyleSheet, View, type ViewProps } from 'react-native'

import { colors, layout, radius, shadow, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type AppCardProps = ViewProps & {
	elevated?: boolean
	padding?: number
}

export function AppCard({
	elevated = false,
	padding = spacing.lg,
	style,
	children,
	...rest
}: AppCardProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: palette.surface,
					borderColor: palette.border,
					padding,
				},
				elevated && shadow.sm,
				style,
			]}
			{...rest}>
			{children}
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		borderRadius: layout.courseCardRadius,
		borderWidth: 1,
		overflow: 'hidden',
	},
})
