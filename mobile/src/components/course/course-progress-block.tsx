import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type CourseProgressBlockProps = {
	label: string
	percent: number
	lessonsLabel: string
}

export function CourseProgressBlock({
	label,
	percent,
	lessonsLabel,
}: CourseProgressBlockProps) {
	const theme = useFigmaTheme()
	const clamped = Math.min(100, Math.max(0, percent))

	return (
		<View style={styles.wrap}>
			<View style={styles.row}>
				<AppText variant="bodyStrong" style={{ color: theme.heading }}>
					{label}
				</AppText>
				<AppText variant="bodyStrong" style={{ color: theme.accent }}>
					{clamped}%
				</AppText>
			</View>
			<View style={[styles.barBg, { backgroundColor: theme.progressTrack }]}>
				<View style={[styles.barFill, { width: `${clamped}%`, backgroundColor: theme.progressFill }]} />
			</View>
			<AppText variant="caption" style={{ color: theme.textMuted }}>
				{lessonsLabel}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { gap: spacing.sm, marginBottom: spacing.lg },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
	barFill: { height: 8, borderRadius: 4 },
})
