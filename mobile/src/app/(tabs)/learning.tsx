import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
	MyCoursesHeader,
	MyCoursesProgressCard,
	MyCoursesSavedCard,
	MyCoursesSegment,
} from '@/components/my-courses'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useCourses, useStudentDashboard } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import {
	buildCompletedRows,
	buildInProgressRows,
	buildSavedRows,
	getDefaultSavedSeed,
	type MyCoursesTab,
} from '@/lib/my-courses-data'
import { useSavedCourses } from '@/store/saved-courses-store'

export default function LearningTab() {
	const { t } = useTranslation()
	const locale = useLocale()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const [tab, setTab] = useState<MyCoursesTab>('saved')

	const { data: dashboard, isLoading: dashLoading, refetch, isRefetching } =
		useStudentDashboard()
	const { data: courses, isLoading: coursesLoading } = useCourses()
	const savedIds = useSavedCourses((s) => s.ids)
	const hydrated = useSavedCourses((s) => s.hydrated)
	const hydrateSaved = useSavedCourses((s) => s.hydrate)
	const seedIfEmpty = useSavedCourses((s) => s.seedIfEmpty)

	useFocusEffect(
		useCallback(() => {
			void refetch()
			void hydrateSaved().then(() => {
				if (courses?.length) {
					void seedIfEmpty(getDefaultSavedSeed(courses))
				}
			})
		}, [refetch, hydrateSaved, seedIfEmpty, courses]),
	)

	const inProgressRows = useMemo(
		() => buildInProgressRows(dashboard?.inProgress ?? [], courses, locale),
		[dashboard?.inProgress, courses, locale],
	)
	const completedRows = useMemo(
		() => buildCompletedRows(dashboard?.inProgress ?? [], courses, locale),
		[dashboard?.inProgress, courses, locale],
	)
	const savedRows = useMemo(
		() => buildSavedRows(savedIds, courses, locale),
		[savedIds, courses, locale],
	)

	const rows =
		tab === 'saved' ? savedRows : tab === 'inProgress' ? inProgressRows : completedRows

	const isLoading = dashLoading || coursesLoading || !hydrated
	const openCourse = (courseId: string) =>
		router.push({ pathname: '/course/[courseId]', params: { courseId } })

	const emptyTitle =
		tab === 'saved'
			? t('myCourses.emptySavedTitle')
			: tab === 'inProgress'
				? t('myCourses.emptyInProgressTitle')
				: t('myCourses.emptyCompletedTitle')
	const emptyDesc =
		tab === 'saved'
			? t('myCourses.emptySavedDesc')
			: tab === 'inProgress'
				? t('myCourses.emptyInProgressDesc')
				: t('myCourses.emptyCompletedDesc')

	return (
		<View style={[styles.screen, { backgroundColor: theme.background }]}>
			<MyCoursesHeader onNotificationsPress={() => router.push('/notifications')} />
			<View style={styles.segmentWrap}>
				<MyCoursesSegment active={tab} onChange={setTab} />
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + spacing['3xl'] + 72 },
				]}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={() => void refetch()}
						tintColor={theme.accent}
						colors={[theme.accent]}
					/>
				}>
				{isLoading ? (
					<ActivityIndicator
						style={styles.loader}
						color={theme.accent}
						size="large"
					/>
				) : rows.length === 0 ? (
					<AppEmptyState
						title={emptyTitle}
						description={emptyDesc}
						actionLabel={t('myCourses.exploreMore')}
						onAction={() => router.push('/home')}
						style={styles.empty}
					/>
				) : (
					rows.map((row) => {
						if (tab === 'saved') {
							return (
								<MyCoursesSavedCard
									key={row.courseId}
									row={row}
									onPress={() => openCourse(row.courseId)}
									onEnroll={() => openCourse(row.courseId)}
								/>
							)
						}
						return (
							<MyCoursesProgressCard
								key={row.courseId}
								row={row}
								variant={tab === 'inProgress' ? 'inProgress' : 'completed'}
								onPress={() => openCourse(row.courseId)}
								onCertificate={() =>
									Alert.alert(
										t('myCourses.viewCertificate'),
										t('myCourses.certificateSoon'),
									)
								}
							/>
						)
					})
				)}

				{rows.length > 0 ? (
					<Pressable
						onPress={() => router.push('/home')}
						style={styles.exploreWrap}
						accessibilityRole="link">
						<AppText variant="body" style={[styles.exploreLink, { color: theme.exploreLink }]}>
							{t('myCourses.exploreMore')}
						</AppText>
					</Pressable>
				) : null}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	segmentWrap: {
		flexGrow: 0,
		flexShrink: 0,
	},
	scroll: { flex: 1 },
	scrollContent: {
		flexGrow: 0,
		paddingTop: spacing.sm,
	},
	empty: {
		paddingTop: spacing['2xl'],
		paddingBottom: spacing.lg,
		alignItems: 'flex-start',
		paddingHorizontal: spacing.lg,
	},
	loader: {
		marginTop: spacing.xl,
		alignSelf: 'center',
	},
	exploreWrap: {
		alignItems: 'center',
		marginTop: spacing.md,
		marginBottom: spacing.lg,
		paddingVertical: spacing.sm,
	},
	exploreLink: {
		fontSize: 12,
		fontWeight: '600',
		textDecorationLine: 'underline',
		letterSpacing: 0.6,
	},
})
