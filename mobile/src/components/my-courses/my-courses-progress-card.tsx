import { Ionicons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { categoryColor } from '@/lib/category-colors'
import type { MyCourseRow } from '@/lib/my-courses-data'

type Props = {
	row: MyCourseRow
	variant: 'inProgress' | 'completed'
	onPress: () => void
	onCertificate?: () => void
}

export function MyCoursesProgressCard({ row, variant, onPress, onCertificate }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const thumbColor = categoryColor(row.category)
	const showProgress = variant === 'inProgress'

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				{
					borderColor: theme.cardBorder,
					backgroundColor: theme.surface,
					shadowColor: theme.cardShadow,
				},
				pressed && styles.pressed,
			]}>
			<View style={styles.thumbWrap}>
				{row.previewImage ? (
					<Image source={{ uri: row.previewImage }} style={styles.thumb} resizeMode="cover" />
				) : (
					<View style={[styles.thumbPlaceholder, { backgroundColor: thumbColor }]} />
				)}
				<View style={[styles.thumbOverlay, { backgroundColor: theme.thumbOverlay }]} />
			</View>

			<View style={styles.body}>
				<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]} numberOfLines={2}>
					{row.title}
				</AppText>
				<AppText variant="small" style={[styles.institution, { color: theme.accent }]} numberOfLines={2}>
					{row.institution}
				</AppText>
				<View style={styles.ratingRow}>
					<Ionicons name="star" size={10} color={theme.accent} />
					<AppText variant="small" style={[styles.rating, { color: theme.accent }]}>
						{row.rating}
					</AppText>
				</View>
				<AppText variant="small" style={[styles.desc, { color: theme.textMuted }]} numberOfLines={2}>
					{row.description || t('myCourses.cardDescriptionFallback')}
				</AppText>

				{showProgress ? (
					<View style={styles.progressBlock}>
						<View style={[styles.progressTrack, { backgroundColor: theme.progressTrack }]}>
							<View style={[styles.progressFill, { width: `${row.percent}%`, backgroundColor: theme.progressFill }]} />
						</View>
						<AppText variant="small" style={[styles.percent, { color: theme.textMuted }]}>
							{t('home.percentCompleted', { percent: row.percent })}
						</AppText>
					</View>
				) : (
					<Pressable onPress={onCertificate} style={[styles.certBtn, { backgroundColor: theme.tabActiveBg }]} hitSlop={6}>
						<AppText variant="small" style={[styles.certText, { color: theme.buttonText }]}>
							{t('myCourses.viewCertificate')}
						</AppText>
					</Pressable>
				)}
			</View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		minHeight: 132,
		marginHorizontal: spacing.lg,
		marginBottom: spacing.lg,
		borderRadius: 5,
		borderWidth: 1,
		padding: spacing.sm,
		shadowOffset: { width: -1, height: 1 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 3,
	},
	pressed: { opacity: 0.94 },
	thumbWrap: {
		width: 95,
		height: 107,
		borderRadius: 6,
		overflow: 'hidden',
		alignSelf: 'center',
	},
	thumb: { width: '100%', height: '100%' },
	thumbPlaceholder: { width: '100%', height: '100%', opacity: 0.9 },
	thumbOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	body: {
		flex: 1,
		marginLeft: spacing.md,
		paddingVertical: spacing.xs,
	},
	title: {
		fontSize: 14,
		fontWeight: '700',
		letterSpacing: 0.28,
	},
	institution: {
		fontSize: 9,
		marginTop: 2,
		letterSpacing: 0.18,
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: 4,
	},
	rating: {
		fontSize: 7.6,
	},
	desc: {
		fontSize: 7.5,
		marginTop: 6,
		lineHeight: 11,
	},
	progressBlock: {
		marginTop: spacing.sm,
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
	percent: {
		alignSelf: 'flex-end',
		marginTop: 4,
		fontSize: 6,
		letterSpacing: 0.12,
	},
	certBtn: {
		alignSelf: 'flex-start',
		marginTop: spacing.sm,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 5,
	},
	certText: {
		fontSize: 9,
		fontWeight: '500',
	},
})
