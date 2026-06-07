import { StyleSheet, Switch, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import type { Weekday } from '@/store/reminders-store'

type StudyReminderRowProps = {
	weekday: Weekday
	label: string
	subtitle: string
	enabled: boolean
	onToggle: (enabled: boolean) => void
	isLast?: boolean
}

export function StudyReminderRow({
	label,
	subtitle,
	enabled,
	onToggle,
	isLast,
}: StudyReminderRowProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<View
			style={[
				styles.row,
				!isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.divider },
			]}>
			<View style={styles.textCol}>
				<AppText variant="bodyStrong">{label}</AppText>
				<AppText variant="caption" color="secondary">
					{subtitle}
				</AppText>
			</View>
			<Switch
				value={enabled}
				onValueChange={onToggle}
				trackColor={{ false: palette.border, true: colors.primary }}
				thumbColor={colors.white}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 88,
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing.lg,
		gap: spacing.lg,
	},
	textCol: { flex: 1, gap: spacing.xs },
})
