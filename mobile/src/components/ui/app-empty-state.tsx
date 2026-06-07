import { StyleSheet, View, type ViewStyle } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'

type AppEmptyStateProps = {
	title: string
	description?: string
	actionLabel?: string
	onAction?: () => void
	style?: ViewStyle
}

export function AppEmptyState({
	title,
	description,
	actionLabel,
	onAction,
	style,
}: AppEmptyStateProps) {
	return (
		<View style={[styles.wrap, style]}>
			<AppText variant="h3" style={styles.title}>
				{title}
			</AppText>
			{description ? (
				<AppText variant="body" color="secondary" style={styles.desc}>
					{description}
				</AppText>
			) : null}
			{actionLabel && onAction ? (
				<AppButton title={actionLabel} onPress={onAction} style={styles.btn} />
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingVertical: spacing['4xl'],
		paddingHorizontal: spacing['2xl'],
		alignItems: 'center',
		gap: spacing.md,
	},
	title: { textAlign: 'center' },
	desc: { textAlign: 'center' },
	btn: { marginTop: spacing.lg, maxWidth: 320 },
})
