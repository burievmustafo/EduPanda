import { StyleSheet, View, type ViewProps } from 'react-native'

import { spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

export function AppDivider({ style, ...rest }: ViewProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<View
			style={[styles.divider, { backgroundColor: palette.divider }, style]}
			{...rest}
		/>
	)
}

const styles = StyleSheet.create({
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: spacing.md,
	},
})
