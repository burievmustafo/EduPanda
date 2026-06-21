import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'

import { FigmaCourseCard } from '@/components/home/figma-course-card'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import { useSavedCourses } from '@/store/saved-courses-store'
import type { CourseDTO } from '@/types/dto'

type Props = {
	title: string
	courses: CourseDTO[]
	seeAllHref?: string
	showSeeAll?: boolean
	emptyMessage?: string
}

export function HomeCourseRailSection({
	title,
	courses,
	seeAllHref,
	showSeeAll = true,
	emptyMessage,
}: Props) {
	const { t } = useTranslation()
	const toggleSaved = useSavedCourses((s) => s.toggle)
	const savedIds = useSavedCourses((s) => s.ids)

	if (courses.length === 0) {
		return (
			<View style={styles.wrap}>
				<HomeSectionHeader title={title} />
				<AppText variant="caption" color="secondary">
					{emptyMessage ?? t('home.noCoursesInCategory')}
				</AppText>
			</View>
		)
	}

	return (
		<View style={styles.wrap}>
			<HomeSectionHeader
				title={title}
				actionLabel={showSeeAll && seeAllHref ? t('home.seeAll') : undefined}
				onAction={
					showSeeAll && seeAllHref
						? () => router.push(seeAllHref as '/home/list')
						: undefined
				}
			/>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.rail}>
				{courses.map((course) => (
					<FigmaCourseCard
						key={course.id}
						course={course}
						onPress={() =>
							router.push({
								pathname: '/course/[courseId]',
								params: { courseId: course.id },
							})
						}
						saved={savedIds.includes(course.id)}
						onBookmarkPress={() => void toggleSaved(course.id)}
					/>
				))}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.xl,
	},
	rail: {
		gap: spacing.md,
		paddingRight: spacing.lg,
	},
})
