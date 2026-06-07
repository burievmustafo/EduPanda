import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type ThemeOptionRowProps = {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	description?: string
	selected: boolean
	onPress: () => void
	isLast?: boolean
}

export function ThemeOptionRow({
	icon,
	label,
	description,
	selected,
	onPress,
	isLast,
}: ThemeOptionRowProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme)

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				!isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.divider },
				pressed && { opacity: 0.88 },
			]}>
			<View
				style={[
					styles.iconWrap,
					{
						backgroundColor: selected ? colors.primarySoft : palette.surfaceMuted,
					},
				]}>
				<Ionicons
					name={icon}
					size={22}
					color={selected ? colors.primary : palette.textSecondary}
				/>
			</View>
			<View style={styles.textCol}>
				<AppText variant="bodyStrong">{label}</AppText>
				{description ? (
					<AppText variant="caption" color="secondary">
						{description}
					</AppText>
				) : null}
			</View>
			{selected ? (
				<Ionicons name="checkmark-circle" size={24} color={colors.primary} />
			) : (
				<View style={[styles.radio, { borderColor: palette.border }]} />
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 72,
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing.md,
		gap: spacing.lg,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textCol: { flex: 1, gap: spacing.xxs },
	radio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
	},
})
