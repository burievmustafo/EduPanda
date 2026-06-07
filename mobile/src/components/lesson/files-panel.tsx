import { StyleSheet, View } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'

type FileRow = { label: string; value: string }

type FilesPanelProps = {
	rows: FileRow[]
	emptyTitle: string
	emptyDescription?: string
}

export function FilesPanel({ rows, emptyTitle, emptyDescription }: FilesPanelProps) {
	if (rows.length === 0) {
		return <AppEmptyState title={emptyTitle} description={emptyDescription} />
	}

	return (
		<AppCard style={styles.card}>
			{rows.map((row, i) => (
				<View key={row.label} style={[styles.row, i > 0 && styles.rowBorder]}>
					<AppText variant="body">{row.label}</AppText>
					<AppText variant="caption" color="secondary">
						{row.value}
					</AppText>
				</View>
			))}
		</AppCard>
	)
}

const styles = StyleSheet.create({
	card: { padding: 0, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: spacing.lg,
		gap: spacing.md,
	},
	rowBorder: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(128,128,128,0.2)',
	},
})
