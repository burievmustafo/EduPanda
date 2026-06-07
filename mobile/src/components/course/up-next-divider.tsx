import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type UpNextDividerProps = { title: string }

export function UpNextDivider({ title }: UpNextDividerProps) {
	const theme = useFigmaTheme()

	return (
		<View style={styles.row}>
			<View style={[styles.line, { backgroundColor: theme.progressTrack }]} />
			<AppText variant="captionStrong" style={[styles.label, { color: theme.textMuted }]}>
				{title}
			</AppText>
			<View style={[styles.line, { backgroundColor: theme.progressTrack }]} />
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: spacing.lg,
		gap: spacing.md,
	},
	line: { flex: 1, height: StyleSheet.hairlineWidth },
	label: { paddingHorizontal: spacing.sm },
})
