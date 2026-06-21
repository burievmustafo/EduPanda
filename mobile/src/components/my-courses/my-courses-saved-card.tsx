import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { CoursePreviewImage } from '@/components/course/course-preview-image'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { MyCourseRow } from '@/lib/my-courses-data'

type Props = {
	row: MyCourseRow
	onPress: () => void
	onEnroll: () => void
}

export function MyCoursesSavedCard({ row, onPress, onEnroll }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()

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
				<CoursePreviewImage
					uri={row.previewImage}
					style={styles.thumb}
					containerStyle={styles.thumbPlaceholder}
					iconSize={20}
					labelSize={7}
				/>
				<View style={[styles.thumbOverlay, { backgroundColor: theme.thumbOverlay }]} />
			</View>

			<View style={styles.body}>
				<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]} numberOfLines={2}>
					{row.title}
				</AppText>
				<AppText variant="small" style={[styles.institution, { color: theme.accent }]} numberOfLines={1}>
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

				<View style={styles.footer}>
					<Pressable onPress={onEnroll} style={[styles.enrollBtn, { backgroundColor: theme.buttonBg }]} hitSlop={6}>
						<AppText variant="small" style={[styles.enrollText, { color: theme.buttonText }]}>
							{t('myCourses.enrollNow')}
						</AppText>
					</Pressable>
					<View style={styles.students}>
						<Ionicons name="people" size={11} color={theme.accent} />
						<AppText variant="small" style={[styles.studentCount, { color: theme.accent }]}>
							{row.lessonsCount * 137}
						</AppText>
					</View>
				</View>
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
		letterSpacing: 0.15,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: spacing.sm,
	},
	enrollBtn: {
		paddingHorizontal: 6,
		paddingVertical: 4,
		borderRadius: 5,
	},
	enrollText: {
		fontSize: 9,
		fontWeight: '500',
	},
	students: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	studentCount: {
		fontSize: 7.6,
	},
})
