import { Ionicons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { categoryColor } from '@/lib/category-colors'
import { getFigmaMockRating } from '@/lib/figma-mock-rating'

type Props = {
	title: string
	subtitle: string
	percent: number
	thumbnailUri?: string
	category?: string
	courseId?: string
	completedLabel: string
	onPress: () => void
}

export function ContinueWatchingCard({
	title,
	subtitle,
	percent,
	thumbnailUri,
	category,
	courseId,
	completedLabel,
	onPress,
}: Props) {
	const theme = useFigmaTheme()
	const clamped = Math.min(100, Math.max(0, Math.round(percent)))
	const rating = getFigmaMockRating(courseId ?? title)
	const thumbColor = categoryColor(category ?? 'General')

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				{
					borderColor: theme.progressTrack,
					backgroundColor: theme.surface,
					shadowColor: theme.cardShadow,
				},
				pressed && styles.pressed,
			]}
			accessibilityRole="button">
			<View style={styles.thumbWrap}>
				{thumbnailUri ? (
					<Image
						source={{ uri: thumbnailUri }}
						style={styles.thumbImage}
						resizeMode="cover"
						accessibilityIgnoresInvertColors
					/>
				) : (
					<View style={[styles.thumbPlaceholder, { backgroundColor: thumbColor }]} />
				)}
			</View>

			<View style={styles.body}>
				<AppText variant="bodyStrong" style={[styles.courseTitle, { color: theme.heading }]} numberOfLines={2}>
					{title}
				</AppText>
				{subtitle ? (
					<AppText variant="small" style={[styles.institution, { color: theme.textMuted }]} numberOfLines={1}>
						{subtitle}
					</AppText>
				) : null}

				<View style={styles.ratingRow}>
					<Ionicons name="star" size={10} color={theme.accent} />
					<AppText variant="small" style={[styles.ratingText, { color: theme.textMuted }]}>
						{rating}
					</AppText>
				</View>

				<View style={styles.progressRow}>
					<View style={[styles.progressTrack, { backgroundColor: theme.progressTrack }]}>
						<View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: theme.progressFill }]} />
					</View>
				</View>

				<AppText variant="small" style={[styles.percentLabel, { color: theme.textMuted }]}>
					{completedLabel}
				</AppText>
			</View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'stretch',
		minHeight: 77,
		borderWidth: 1,
		borderRadius: 5,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.sm,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 2,
	},
	pressed: { opacity: 0.92 },
	thumbWrap: {
		width: 87,
		marginRight: spacing.md,
		alignSelf: 'center',
	},
	thumbImage: {
		width: 87,
		height: 58,
		borderRadius: 5,
	},
	thumbPlaceholder: {
		width: 87,
		height: 58,
		borderRadius: 5,
		opacity: 0.85,
	},
	body: {
		flex: 1,
		justifyContent: 'center',
		paddingVertical: spacing.xs,
	},
	courseTitle: {
		fontSize: 14,
		fontWeight: '700',
		letterSpacing: 0.28,
	},
	institution: {
		fontSize: 7,
		marginTop: 2,
		letterSpacing: 0.14,
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginTop: 4,
	},
	ratingText: {
		fontSize: 6,
		letterSpacing: 0.12,
	},
	progressRow: {
		marginTop: spacing.xs,
	},
	progressTrack: {
		height: 6,
		borderRadius: 5,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 5,
	},
	percentLabel: {
		alignSelf: 'flex-end',
		marginTop: spacing.xs,
		fontSize: 10,
		letterSpacing: 0.12,
	},
})
