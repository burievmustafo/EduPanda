import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { formatTime, tText } from '@/lib/localized'
import type { LessonListItemDTO } from '@/types/dto'

type UpNextCardProps = {
	lesson: LessonListItemDTO
	videoLabel: string
	durationLabel: string
	buttonLabel: string
	onPress: () => void
}

export function UpNextCard({
	lesson,
	videoLabel,
	durationLabel,
	buttonLabel,
	onPress,
}: UpNextCardProps) {
	const locale = useLocale()
	const theme = useFigmaTheme()

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: theme.surface,
					borderColor: theme.cardBorder,
					shadowColor: theme.cardShadow,
				},
			]}>
			<AppText variant="caption" style={{ color: theme.textMuted }}>
				{durationLabel}
			</AppText>
			<AppText variant="title" style={{ color: theme.heading }} numberOfLines={2}>
				{tText(lesson.title, locale)}
			</AppText>
			<View style={styles.chips}>
				<View style={[styles.chip, { backgroundColor: theme.notificationCardBg }]}>
					<Ionicons name="videocam-outline" size={14} color={theme.accent} />
					<AppText variant="small" style={{ color: theme.accent }}>
						{videoLabel}
					</AppText>
				</View>
				<View style={[styles.chip, { backgroundColor: theme.notificationCardBg }]}>
					<Ionicons name="time-outline" size={14} color={theme.textMuted} />
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{formatTime(lesson.durationSec)}
					</AppText>
				</View>
			</View>
			<AppButton title={buttonLabel} onPress={onPress} />
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		gap: spacing.md,
		marginBottom: spacing['2xl'],
		padding: spacing.lg,
		borderRadius: 12,
		borderWidth: 1,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 2,
	},
	chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		borderRadius: 8,
	},
})
