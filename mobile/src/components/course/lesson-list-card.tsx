import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { formatTime, tText } from '@/lib/localized'
import type { LessonListItemDTO } from '@/types/dto'

type LessonListCardProps = {
	lesson: LessonListItemDTO
	enrolled: boolean
	videoLabel: string
	onPress: () => void
}

export function LessonListCard({ lesson, enrolled, videoLabel, onPress }: LessonListCardProps) {
	const locale = useLocale()
	const theme = useFigmaTheme()
	const locked = !lesson.free && !enrolled
	const completed = lesson.progress?.isCompleted
	const pct = lesson.progress?.watchedPercent ?? 0

	const iconName: keyof typeof Ionicons.glyphMap = locked
		? 'lock-closed-outline'
		: completed
			? 'checkmark-circle'
			: 'play-circle-outline'

	const iconColor = locked
		? theme.textMuted
		: completed
			? theme.accent
			: theme.accent

	return (
		<Pressable
			disabled={locked}
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				{
					borderColor: theme.cardBorder,
					backgroundColor: theme.surface,
					opacity: locked ? 0.5 : pressed ? 0.88 : 1,
				},
			]}>
			<Ionicons name={iconName} size={28} color={iconColor} />
			<View style={styles.body}>
				<AppText variant="bodyStrong" style={{ color: theme.heading }} numberOfLines={2}>
					{tText(lesson.title, locale)}
				</AppText>
				<View style={styles.meta}>
					<View style={[styles.chip, { backgroundColor: theme.notificationCardBg }]}>
						<AppText variant="small" style={{ color: theme.textMuted }}>
							{videoLabel}
						</AppText>
					</View>
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{formatTime(lesson.durationSec)}
					</AppText>
				</View>
				{pct > 0 && !completed ? (
					<View style={[styles.barBg, { backgroundColor: theme.progressTrack }]}>
						<View style={[styles.barFill, { width: `${pct}%`, backgroundColor: theme.progressFill }]} />
					</View>
				) : null}
			</View>
			<Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		padding: spacing.lg,
		borderWidth: 1,
		borderRadius: 12,
		marginBottom: spacing.md,
	},
	body: { flex: 1, gap: spacing.xs },
	meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	chip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
	barBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: spacing.xs },
	barFill: { height: 4, borderRadius: 2 },
})
