import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { categoryColor } from '@/lib/category-colors'
import { spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'
import type { CourseDTO } from '@/types/dto'

type CourseTopHeaderProps = {
	course: CourseDTO
}

export function CourseTopHeader({ course }: CourseTopHeaderProps) {
	const locale = useLocale()
	const accent = categoryColor(course.category)

	return (
		<View style={[styles.banner, { backgroundColor: accent }]}>
			<View style={styles.topRow}>
				<AppText variant="small" style={styles.cat}>
					{course.category} · {course.level}
				</AppText>
			</View>
			<AppText variant="h2" style={styles.title}>
				{tText(course.title, locale)}
			</AppText>
			<AppText variant="caption" style={styles.meta}>
				{course.instructor.fullName}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	banner: { borderRadius: 16, padding: spacing['2xl'], gap: spacing.xs },
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	cat: { color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 0.4 },
	title: { color: '#fff' },
	meta: { color: 'rgba(255,255,255,0.88)', marginTop: spacing.xs },
})
