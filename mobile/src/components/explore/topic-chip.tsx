import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type IoniconName = keyof typeof Ionicons.glyphMap

type TopicChipProps = {
	icon: IoniconName
	label: string
	color?: string
	selected?: boolean
	onPress?: () => void
}

export function TopicChip({
	icon,
	label,
	color = colors.primary,
	selected,
	onPress,
}: TopicChipProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.chip,
				{
					borderColor: selected ? color : palette.border,
					backgroundColor: selected ? colors.primarySoft : palette.surface,
					opacity: pressed ? 0.85 : 1,
				},
			]}>
			<Ionicons name={icon} size={22} color={color} />
			<AppText variant="bodyStrong" style={{ color: selected ? color : palette.textPrimary }}>
				{label}
			</AppText>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	chip: {
		height: 52,
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		borderWidth: 1.2,
		borderRadius: radius.md,
		paddingHorizontal: spacing.lg,
	},
})
