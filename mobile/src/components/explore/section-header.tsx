import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'

type SectionHeaderProps = {
	title: string
	actionLabel?: string
	onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
	return (
		<View style={styles.row}>
			<AppText variant="h2" style={styles.title}>
				{title}
			</AppText>
			{actionLabel && onAction ? (
				<Pressable onPress={onAction} hitSlop={8}>
					<AppText variant="body" color="brand">
						{actionLabel}
					</AppText>
				</Pressable>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: spacing['3xl'],
		marginBottom: spacing.md,
	},
	title: { flex: 1 },
})
