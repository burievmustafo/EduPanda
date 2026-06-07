import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type QuizAssignmentCardProps = {
	title: string
	locked: boolean
	lockedHint?: string
	onPress: () => void
}

export function QuizAssignmentCard({
	title,
	locked,
	lockedHint,
	onPress,
}: QuizAssignmentCardProps) {
	const theme = useFigmaTheme()

	return (
		<Pressable
			disabled={locked}
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				{
					borderColor: locked ? theme.cardBorder : theme.accent,
					backgroundColor: locked ? theme.surface : theme.notificationCardBg,
					opacity: locked ? 0.65 : pressed ? 0.9 : 1,
				},
			]}>
			<Ionicons
				name={locked ? 'lock-closed-outline' : 'help-circle-outline'}
				size={28}
				color={locked ? theme.textMuted : theme.accent}
			/>
			<View style={styles.body}>
				<AppText
					variant="bodyStrong"
					style={{ color: locked ? theme.textMuted : theme.accent }}>
					{title}
				</AppText>
				{locked && lockedHint ? (
					<AppText variant="caption" style={{ color: theme.textMuted }}>
						{lockedHint}
					</AppText>
				) : null}
			</View>
			{!locked ? (
				<Ionicons name="chevron-forward" size={20} color={theme.accent} />
			) : null}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		padding: spacing.lg,
		borderWidth: 1.5,
		borderRadius: 12,
		marginTop: spacing.sm,
	},
	body: { flex: 1, gap: spacing.xs },
})
