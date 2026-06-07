import { Ionicons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, layout, radius, spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import { tText } from '@/lib/localized'
import type { CourseDTO } from '@/types/dto'

type CompactCourseRowProps = {
	course: CourseDTO
	onPress: () => void
}

export function CompactCourseRow({ course, onPress }: CompactCourseRowProps) {
	const locale = useLocale()
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, { opacity: pressed ? 0.88 : 1 }]}>
			<View style={styles.textCol}>
				<AppText variant="title" numberOfLines={2}>
					{tText(course.title, locale)}
				</AppText>
				<AppText variant="caption" color="secondary" numberOfLines={1}>
					{course.instructor.fullName}
				</AppText>
				<AppText variant="caption" color="tertiary">
					{course.category} · {course.level}
				</AppText>
				<View style={styles.metaRow}>
					<Ionicons name="book-outline" size={14} color={palette.textTertiary} />
					<AppText variant="small" color="tertiary">
						{course.lessonsCount} lessons
					</AppText>
				</View>
			</View>
			{course.previewImage ? (
				<Image source={{ uri: course.previewImage }} style={styles.thumb} />
			) : (
				<View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: palette.surfaceMuted }]}>
					<Ionicons name="school-outline" size={28} color={colors.primary} />
				</View>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: layout.listRowMinHeight + 24,
		paddingVertical: spacing.md,
		gap: spacing.lg,
	},
	textCol: { flex: 1, gap: spacing.xs },
	metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
	thumb: {
		width: 64,
		height: 64,
		borderRadius: radius.sm,
	},
	thumbPlaceholder: {
		alignItems: 'center',
		justifyContent: 'center',
	},
})
