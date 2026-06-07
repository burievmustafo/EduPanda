import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, layout } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type AppIconButtonProps = PressableProps & {
	name: keyof typeof Ionicons.glyphMap
	size?: number
	color?: string
}

export function AppIconButton({
	name,
	size = layout.iconVisualSize,
	color,
	style,
	...rest
}: AppIconButtonProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const iconColor = color ?? palette.textPrimary

	return (
		<Pressable
			style={({ pressed }) => [
				styles.hit,
				pressed && styles.pressed,
				style as ViewStyle,
			]}
			hitSlop={8}
			{...rest}>
			<Ionicons name={name} size={size} color={iconColor} />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	hit: {
		width: layout.iconTouchSize,
		height: layout.iconTouchSize,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressed: { opacity: 0.7 },
})
