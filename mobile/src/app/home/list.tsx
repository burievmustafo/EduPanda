import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'

import { CompactCourseRow } from '@/components/explore/compact-course-row'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourses } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import {
	getCategoryLabel,
	getCourseCategories,
	filterCoursesByCategory,
} from '@/lib/home-categories'
import {
	getAllSuggestionCourses,
	getAllTopCourses,
} from '@/lib/home-course-lists'
import type { HomeListKind } from '@/lib/home-list-routes'
import type { CourseDTO } from '@/types/dto'

function isListKind(value: string | undefined): value is HomeListKind {
	return (
		value === 'suggestions' ||
		value === 'top' ||
		value === 'categories' ||
		value === 'category'
	)
}

export default function HomeListScreen() {
	const { t } = useTranslation()
	const locale = useLocale()
	const theme = useFigmaTheme()
	const params = useLocalSearchParams<{ list?: string; category?: string }>()
	const listKind = isListKind(params.list) ? params.list : 'top'
	const categoryFilter =
		typeof params.category === 'string' && params.category.length > 0
			? params.category
			: null

	const { data: courses, isLoading } = useCourses()

	const title = useMemo(() => {
		if (listKind === 'suggestions') return t('home.suggestions')
		if (listKind === 'top') return t('home.topCourses')
		if (listKind === 'category' && categoryFilter) {
			return getCategoryLabel(categoryFilter, locale)
		}
		return t('home.allCategories')
	}, [listKind, categoryFilter, locale, t])

	const rows = useMemo(() => {
		if (!courses) return []
		if (listKind === 'suggestions') {
			return getAllSuggestionCourses(courses, categoryFilter)
		}
		if (listKind === 'top') {
			return getAllTopCourses(courses, categoryFilter)
		}
		if (listKind === 'category' && categoryFilter) {
			return filterCoursesByCategory(courses, categoryFilter)
		}
		return []
	}, [courses, listKind, categoryFilter])

	const grouped = useMemo(() => {
		if (listKind !== 'categories' || !courses) return []
		const cats = getCourseCategories(courses)
		return cats.map((cat) => ({
			category: cat,
			courses: filterCoursesByCategory(courses, cat),
		}))
	}, [courses, listKind])

	const onCoursePress = (courseId: string) => {
		router.push({ pathname: '/course/[courseId]', params: { courseId } })
	}

	if (isLoading && !courses) {
		return (
			<View style={[styles.centered, { backgroundColor: theme.background }]}>
				<ActivityIndicator color={theme.accent} />
			</View>
		)
	}

	return (
		<>
			<Stack.Screen options={{ title }} />
			<ScrollView
				style={[styles.scroll, { backgroundColor: theme.background }]}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>

			{listKind === 'categories' ? (
				grouped.length === 0 ? (
					<AppText variant="caption" color="secondary">
						{t('home.noCourses')}
					</AppText>
				) : (
					grouped.map((group) => (
						<View key={group.category} style={styles.group}>
							<HomeSectionHeader
								title={getCategoryLabel(group.category, locale)}
								actionLabel={t('home.seeAll')}
								onAction={() =>
									router.push({
										pathname: '/home/list',
										params: { list: 'category', category: group.category },
									})
								}
							/>
							<View style={styles.list}>
								{group.courses.map((course: CourseDTO) => (
									<CompactCourseRow
										key={course.id}
										course={course}
										onPress={() => onCoursePress(course.id)}
									/>
								))}
							</View>
						</View>
					))
				)
			) : rows.length === 0 ? (
				<AppText variant="caption" color="secondary">
					{categoryFilter
						? t('home.noCoursesInCategoryNamed', {
								category: getCategoryLabel(categoryFilter, locale),
							})
						: t('home.noCoursesInCategory')}
				</AppText>
			) : (
				<View style={styles.list}>
					{rows.map((course) => (
						<CompactCourseRow
							key={course.id}
							course={course}
							onPress={() => onCoursePress(course.id)}
						/>
					))}
				</View>
			)}
			</ScrollView>
		</>
	)
}

const styles = StyleSheet.create({
	scroll: { flex: 1 },
	content: {
		padding: spacing.lg,
		paddingBottom: spacing['3xl'],
	},
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	group: {
		marginBottom: spacing.xl,
	},
	list: {
		gap: spacing.xs,
	},
})
