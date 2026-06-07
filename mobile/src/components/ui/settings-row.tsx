import { Pressable, StyleSheet, Switch, View, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { AppText } from '@/components/ui/app-text'
import { colors, layout, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type SettingsRowProps = {
	label: string
	subtitle?: string
	icon?: keyof typeof Ionicons.glyphMap
	onPress?: () => void
	showChevron?: boolean
	switchValue?: boolean
	onSwitchChange?: (value: boolean) => void
	style?: ViewStyle
}

export function SettingsRow({
	label,
	subtitle,
	icon,
	onPress,
	showChevron = !!onPress,
	switchValue,
	onSwitchChange,
	style,
}: SettingsRowProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const hasSwitch = onSwitchChange !== undefined

	const content = (
		<View style={[styles.row, { borderBottomColor: palette.borderLight }, style]}>
			{icon ? (
				<View style={[styles.iconWrap, { backgroundColor: palette.surfaceMuted }]}>
					<Ionicons name={icon} size={22} color={palette.primary} />
				</View>
			) : null}
			<View style={styles.textCol}>
				<AppText variant="bodyStrong">{label}</AppText>
				{subtitle ? (
					<AppText variant="caption" color="secondary">
						{subtitle}
					</AppText>
				) : null}
			</View>
			{hasSwitch ? (
				<Switch
					value={switchValue}
					onValueChange={onSwitchChange}
					trackColor={{ false: palette.border, true: colors.primary }}
					thumbColor={colors.white}
				/>
			) : showChevron ? (
				<Ionicons name="chevron-forward" size={20} color={palette.textTertiary} />
			) : null}
		</View>
	)

	if (onPress && !hasSwitch) {
		return (
			<Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
				{content}
			</Pressable>
		)
	}

	return content
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: layout.settingsRowHeight,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing['2xl'],
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: spacing.lg,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textCol: { flex: 1, gap: spacing.xs },
	pressed: { opacity: 0.85 },
})
