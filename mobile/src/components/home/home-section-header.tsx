import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type Props = {
	title: string
	actionLabel?: string
	onAction?: () => void
}

export function HomeSectionHeader({ title, actionLabel, onAction }: Props) {
	const theme = useFigmaTheme()

	return (
		<View style={styles.row}>
			<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]}>
				{title}
			</AppText>
			{actionLabel && onAction ? (
				<Pressable onPress={onAction} hitSlop={8}>
					<AppText variant="small" style={[styles.action, { color: theme.accent }]}>
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
		marginBottom: spacing.md,
	},
	title: {
		flex: 1,
		fontSize: 18,
		fontWeight: '700',
		letterSpacing: 0.9,
	},
	action: {
		textDecorationLine: 'underline',
		textTransform: 'capitalize',
		fontSize: 10,
		letterSpacing: 0.2,
	},
})
