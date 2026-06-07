import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
	CategoriesSection,
	ContinueWatchingSection,
	HomeCourseRailSection,
	HomeHeader,
	HomeSearchBar,
	HomeSearchResults,
} from '@/components/home'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourses, useMe, useNotificationCount, useStudentDashboard } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { getDisplayFirstName } from '@/lib/display-name'
import { getCategoryLabel } from '@/lib/home-categories'
import { getSuggestionCourses, getTopCourses } from '@/lib/home-course-lists'
import { homeListHref } from '@/lib/home-list-routes'
import { filterCoursesBySearch } from '@/lib/home-search'
import { useSavedCourses } from '@/store/saved-courses-store'

export default function HomeTab() {
	const { t } = useTranslation()
	const locale = useLocale()
	const theme = useFigmaTheme()
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	const { data: me, isLoading: meLoading, refetch: refetchMe } = useMe()
	const {
		data: dashboard,
		isLoading: dashboardLoading,
		refetch: refetchDashboard,
	} = useStudentDashboard()
	const { data: courses, refetch: refetchCourses, isRefetching } = useCourses()
	const { data: unreadCount = 0, refetch: refetchNotificationCount } =
		useNotificationCount()
	const hydrateSaved = useSavedCourses((s) => s.hydrate)

	const displayName = useMemo(() => getDisplayFirstName(me?.fullName), [me?.fullName])
	const inProgress = dashboard?.inProgress ?? []

	const isSearching = searchQuery.trim().length > 0

	const searchResults = useMemo(
		() => filterCoursesBySearch(courses, searchQuery, locale),
		[courses, searchQuery, locale],
	)

	const suggestions = useMemo(
		() => getSuggestionCourses(courses, selectedCategory),
		[courses, selectedCategory],
	)
	const topCourses = useMemo(
		() => getTopCourses(courses, selectedCategory),
		[courses, selectedCategory],
	)

	const emptyCategoryMsg = selectedCategory
		? t('home.noCoursesInCategoryNamed', {
				category: getCategoryLabel(selectedCategory, locale),
			})
		: t('home.noCoursesInCategory')

	const onRefresh = useCallback(() => {
		void refetchMe().catch(() => {})
		void refetchCourses().catch(() => {})
		void refetchDashboard().catch(() => {})
		void refetchNotificationCount().catch(() => {})
	}, [refetchMe, refetchCourses, refetchDashboard, refetchNotificationCount])

	useFocusEffect(
		useCallback(() => {
			void refetchMe().catch(() => {})
			void refetchDashboard().catch(() => {})
			void refetchCourses().catch(() => {})
			void refetchNotificationCount().catch(() => {})
			void hydrateSaved().catch(() => {})
		}, [
			refetchMe,
			refetchDashboard,
			refetchCourses,
			refetchNotificationCount,
			hydrateSaved,
		]),
	)

	return (
		<View style={[styles.flex, { backgroundColor: theme.background }]}>
			<SafeAreaView style={styles.flex} edges={['left', 'right']}>
				<ScrollView
					style={[styles.scroll, { backgroundColor: theme.background }]}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={onRefresh}
							tintColor={theme.accent}
							colors={[theme.accent]}
						/>
					}>
					<HomeHeader
						displayName={displayName}
						loading={meLoading && !displayName}
						unreadCount={unreadCount}
						onNotificationsPress={() => router.push('/notifications')}
					/>
					<HomeSearchBar value={searchQuery} onChangeText={setSearchQuery} />

					{isSearching ? (
						<HomeSearchResults courses={searchResults} query={searchQuery.trim()} />
					) : (
						<>
							<ContinueWatchingSection
								items={inProgress}
								courses={courses}
								loading={dashboardLoading && inProgress.length === 0}
							/>

							<CategoriesSection
								courses={courses}
								selectedCategory={selectedCategory}
								onSelectCategory={setSelectedCategory}
							/>

							<HomeCourseRailSection
								title={t('home.suggestions')}
								courses={suggestions}
								seeAllHref={homeListHref({
									list: 'suggestions',
									category: selectedCategory,
								})}
								emptyMessage={emptyCategoryMsg}
							/>

							<HomeCourseRailSection
								title={t('home.topCourses')}
								courses={topCourses}
								seeAllHref={homeListHref({
									list: 'top',
									category: selectedCategory,
								})}
								emptyMessage={emptyCategoryMsg}
							/>
						</>
					)}

					<View style={styles.bottomSpacer} />
				</ScrollView>
			</SafeAreaView>
		</View>
	)
}

const styles = StyleSheet.create({
	flex: { flex: 1 },
	scroll: { flex: 1 },
	scrollContent: {
		paddingBottom: spacing['3xl'],
	},
	bottomSpacer: { height: spacing.lg },
})
