import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { CompactCourseRow } from '@/components/explore/compact-course-row'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import type { CourseDTO } from '@/types/dto'

type Props = {
	courses: CourseDTO[]
	query: string
}

export function HomeSearchResults({ courses, query }: Props) {
	const { t } = useTranslation()

	return (
		<View style={styles.wrap}>
			<AppText variant="title" style={styles.title}>
				{t('home.searchResults')}
			</AppText>
			{courses.length === 0 ? (
				<AppText variant="caption" color="secondary">
					{t('home.searchNoResults', { query })}
				</AppText>
			) : (
				<View style={styles.list}>
					{courses.map((course) => (
						<CompactCourseRow
							key={course.id}
							course={course}
							onPress={() =>
								router.push({
									pathname: '/course/[courseId]',
									params: { courseId: course.id },
								})
							}
						/>
					))}
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.md,
	},
	title: {
		marginBottom: spacing.md,
	},
	list: {
		gap: spacing.xs,
	},
})
