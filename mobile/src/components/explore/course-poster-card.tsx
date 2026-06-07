import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { layout, shadow, spacing } from '@/design/tokens'
import { categoryColor } from '@/lib/category-colors'
import { useLocale } from '@/hooks/use-locale'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import { tText } from '@/lib/localized'
import type { CourseDTO } from '@/types/dto'

export { categoryColor } from '@/lib/category-colors'

type CoursePosterCardProps = {
	course: CourseDTO
	percent?: number
	onPress: () => void
}

export function CoursePosterCard({ course, percent, onPress }: CoursePosterCardProps) {
	const locale = useLocale()
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const accent = categoryColor(course.category)

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				shadow.sm,
				{ backgroundColor: palette.surface, opacity: pressed ? 0.9 : 1 },
			]}>
			<View style={[styles.top, { backgroundColor: accent }]}>
				<AppText variant="small" style={styles.catLabel}>
					{course.category}
				</AppText>
			</View>
			<View style={styles.body}>
				<AppText variant="captionStrong" numberOfLines={2}>
					{tText(course.title, locale)}
				</AppText>
				{percent !== undefined ? (
					<>
						<View style={[styles.progBg, { backgroundColor: palette.surfaceMuted }]}>
							<View style={[styles.progFill, { width: `${Math.min(100, percent)}%`, backgroundColor: accent }]} />
						</View>
						<AppText variant="small" style={{ color: accent }}>
							{percent}% complete
						</AppText>
					</>
				) : (
					<AppText variant="small" color="tertiary">
						{course.lessonsCount} lessons
					</AppText>
				)}
			</View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: { width: 200, borderRadius: layout.courseCardRadius, overflow: 'hidden' },
	top: { height: 70, justifyContent: 'flex-end', padding: spacing.sm },
	catLabel: { color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: 0.5 },
	body: { padding: spacing.sm, gap: spacing.xs },
	progBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
	progFill: { height: 4, borderRadius: 2 },
})
