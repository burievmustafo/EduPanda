import { Ionicons } from '@expo/vector-icons'
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CourseGradesTab } from '@/components/course/course-grades-tab'
import { CourseInfoTab } from '@/components/course/course-info-tab'
import { CourseOptionsSheet } from '@/components/course/course-options-sheet'
import { CourseResourcesTab } from '@/components/course/course-resources-tab'
import { CourseReviewSheet } from '@/components/course/course-review-sheet'
import { CourseProgressBlock } from '@/components/course/course-progress-block'
import { CourseTabBar, type CourseTabKey } from '@/components/course/course-tab-bar'
import { CourseTopHeader } from '@/components/course/course-top-header'
import { LessonListCard } from '@/components/course/lesson-list-card'
import { ModuleChips } from '@/components/course/module-chips'
import { QuizAssignmentCard } from '@/components/course/quiz-assignment-card'
import { UpNextCard } from '@/components/course/up-next-card'
import { UpNextDivider } from '@/components/course/up-next-divider'
import { ListSkeleton } from '@/components/skeleton'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppIconButton } from '@/components/ui/app-icon-button'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme, type FigmaTheme } from '@/design/figma-theme'
import { layout, spacing } from '@/design/tokens'
import { useCourse, useSections } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import {
	findUpNextLesson,
	isQuizUnlocked,
	sectionProgressPercent,
} from '@/lib/course-progress'
import { tText } from '@/lib/localized'
import {
	getCourseDurationLabel,
	getCoursePriceLabel,
	getSortedLessons,
} from '@/lib/course-meta'
import type { CourseDTO, LessonListItemDTO, SectionDTO } from '@/types/dto'

export default function CourseDetailScreen() {
	const { courseId } = useLocalSearchParams<{ courseId: string }>()
	const { t } = useTranslation()
	const locale = useLocale()
	const [tab, setTab] = useState<CourseTabKey>('home')
	const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
	const [optionsOpen, setOptionsOpen] = useState(false)
	const [reviewOpen, setReviewOpen] = useState(false)
	const [descExpanded, setDescExpanded] = useState(false)

	const theme = useFigmaTheme()
	const { data: course, isLoading: lc, refetch: refetchCourse } = useCourse(courseId)
	const { data: sections, isLoading: ls, refetch: refetchSections } = useSections(courseId)

	useFocusEffect(
		useCallback(() => {
			void refetchCourse()
			void refetchSections()
		}, [refetchCourse, refetchSections]),
	)

	useEffect(() => {
		if (sections?.length && !selectedSectionId) {
			const first = [...sections].sort((a, b) => a.position - b.position)[0]
			setSelectedSectionId(first.id)
		}
	}, [sections, selectedSectionId])

	const selectedSection = useMemo(
		() => sections?.find((s) => s.id === selectedSectionId) ?? null,
		[sections, selectedSectionId],
	)

	const upNext = useMemo(
		() => (sections && course ? findUpNextLesson(sections, course.isEnrolled) : null),
		[sections, course],
	)

	const tabs = useMemo(
		() => [
			{ key: 'home' as const, label: t('courseDashboard.tabs.home') },
			{ key: 'grades' as const, label: t('courseDashboard.tabs.grades') },
			{ key: 'resources' as const, label: t('courseDashboard.tabs.resources') },
			{ key: 'info' as const, label: t('courseDashboard.tabs.info') },
		],
		[t],
	)

	const openLesson = (lessonId: string) =>
		router.push({ pathname: '/learn/[lessonId]', params: { lessonId } })

	if (lc || ls || !course) {
		return (
			<View style={[styles.screen, { backgroundColor: theme.background }]}>
				<ListSkeleton count={3} />
			</View>
		)
	}

	const description = tText(course.description, locale)
	const descPreview =
		description.length > 160 && !descExpanded
			? `${description.slice(0, 160)}…`
			: description

	const modulePercent = selectedSection ? sectionProgressPercent(selectedSection) : 0
	const completedInSection = selectedSection
		? selectedSection.lessons.filter((l) => l.progress?.isCompleted).length
		: 0

	if (!course.isEnrolled) {
		return <CourseDisplay course={course} sections={sections ?? []} />
	}

	return (
		<View style={[styles.screen, { backgroundColor: theme.background }]}>
			<Stack.Screen
				options={{
					title: tText(course.title, locale),
					headerStyle: { backgroundColor: theme.background },
					headerTintColor: theme.heading,
					headerShadowVisible: false,
					headerRight: () => (
						<AppIconButton
							name="ellipsis-horizontal"
							onPress={() => setOptionsOpen(true)}
						/>
					),
				}}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}>
				<CourseTopHeader course={course} />

				<CourseTabBar tabs={tabs} active={tab} onChange={setTab} />

				{tab === 'home' ? (
					<View style={styles.tabBody}>
					{sections && sections.length > 0 && selectedSectionId ? (
						<ModuleChips
							sections={sections}
							selectedId={selectedSectionId}
							onSelect={setSelectedSectionId}
						/>
					) : null}

					{selectedSection ? (
						<CourseProgressBlock
							label={tText(selectedSection.title, locale)}
							percent={modulePercent}
							lessonsLabel={`${completedInSection}/${selectedSection.lessons.length} ${t('course.lessons')}`}
						/>
					) : null}

					{upNext ? (
						<>
							<UpNextDivider title={t('courseDashboard.upNext')} />
							<UpNextCard
								lesson={upNext.lesson}
								videoLabel={t('courseDashboard.video')}
								durationLabel={t('courseDashboard.upNext')}
								buttonLabel={t('common.continue')}
								onPress={() => openLesson(upNext.lesson.id)}
							/>
						</>
					) : null}

					<AppText variant="body" style={{ color: theme.textMuted }}>
						{descPreview}
					</AppText>
					{description.length > 160 ? (
						<Pressable onPress={() => setDescExpanded((e) => !e)}>
							<AppText variant="body" style={{ color: theme.accent }}>
								{descExpanded
									? t('courseDashboard.showLess')
									: t('courseDashboard.showMore')}
							</AppText>
						</Pressable>
					) : null}

					{selectedSection ? (
						<>
							<AppText variant="h3" style={[styles.lessonsHeading, { color: theme.heading }]}>
								{t('courseDashboard.lessonsInModule')}
							</AppText>
							{[...selectedSection.lessons]
								.sort((a, b) => a.position - b.position)
								.map((lesson) => (
									<LessonListCard
										key={lesson.id}
										lesson={lesson}
										enrolled
										videoLabel={t('courseDashboard.video')}
										onPress={() => openLesson(lesson.id)}
									/>
								))}
							{selectedSection.hasQuiz ? (
								<QuizAssignmentCard
									title={t('course.sectionQuiz')}
									locked={!isQuizUnlocked(selectedSection, true)}
									lockedHint={t('lesson.completeToUnlockQuiz')}
									onPress={() =>
										router.push({
											pathname: '/quiz/[sectionId]',
											params: { sectionId: selectedSection.id },
										})
									}
								/>
							) : null}
						</>
					) : null}
					</View>
				) : tab === 'grades' ? (
					<CourseGradesTab courseId={courseId} />
				) : tab === 'resources' ? (
					<CourseResourcesTab courseId={courseId} />
				) : tab === 'info' ? (
					<CourseInfoTab course={course} sections={sections ?? []} />
				) : null}
			</ScrollView>

			<CourseOptionsSheet
				visible={optionsOpen}
				courseId={courseId}
				onClose={() => setOptionsOpen(false)}
				onUnenrolled={() => router.back()}
				onLeaveReview={() => setReviewOpen(true)}
			/>
			<CourseReviewSheet
				visible={reviewOpen}
				courseId={courseId}
				onClose={() => setReviewOpen(false)}
			/>
		</View>
	)
}

function CourseDisplay({ course, sections }: { course: CourseDTO; sections: SectionDTO[] }) {
	const { t } = useTranslation()
	const locale = useLocale()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const title = tText(course.title, locale)
	const description = tText(course.description, locale)
	const priceLabel = getCoursePriceLabel(course)
	const lessonCount = sections.reduce((sum, section) => sum + section.lessons.length, 0)
	const allLessons = getSortedLessons(sections)
	const durationLabel = getCourseDurationLabel(sections)

	const openLesson = (lesson: LessonListItemDTO) => {
		router.push({ pathname: '/learn/[lessonId]', params: { lessonId: lesson.id } })
	}

	const openFirstPreview = () => {
		const preview = allLessons[0]
		if (!preview) return
		openLesson(preview)
	}

	const handlePrimaryAction = async () => {
		if (course.isEnrolled) {
			openFirstPreview()
			return
		}
		router.push({ pathname: '/payment/overview', params: { courseId: course.id } })
	}

	return (
		<View style={[styles.displayScreen, { backgroundColor: theme.background }]}>
			<Stack.Screen options={{ headerShown: false }} />
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
				<View style={styles.displayHero}>
					<Image
						source={{ uri: course.previewImage ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900' }}
						style={styles.heroImage}
					/>
					{allLessons.length > 0 ? (
						<Pressable
							style={[styles.heroPlayButton, { backgroundColor: theme.buttonBg }]}
							onPress={openFirstPreview}>
							<Ionicons name="play" size={28} color={theme.buttonText} />
						</Pressable>
					) : null}
					<View style={[styles.heroOverlay, { paddingTop: insets.top + spacing.sm }]}>
						<Pressable
							style={[styles.roundButton, { backgroundColor: theme.surface }]}
							onPress={() => router.back()}>
							<Ionicons name="chevron-back" size={26} color={theme.heading} />
						</Pressable>
					</View>
				</View>

				<View style={styles.displayBody}>
					<View style={styles.providerRow}>
						<View style={[styles.providerLogo, { backgroundColor: theme.notificationCardBg }]}>
							{course.instructor.picture ? (
								<Image
									source={{ uri: course.instructor.picture }}
									style={styles.providerAvatar}
								/>
							) : (
								<Ionicons name="school-outline" size={22} color={theme.accent} />
							)}
						</View>
						<View>
							<AppText variant="small" style={{ color: theme.textMuted }}>
								{course.instructor.fullName}
							</AppText>
							<AppText variant="small" style={{ color: theme.accent }}>
								{course.category} • {course.level}
							</AppText>
						</View>
					</View>

					<AppText variant="h2" style={[styles.displayTitle, { color: theme.heading }]}>
						{title}
					</AppText>
					<AppText variant="body" style={[styles.displayDesc, { color: theme.textMuted }]}>
						{description}
					</AppText>

					<View style={styles.statsRow}>
						<StatPill theme={theme} icon="time-outline" label={durationLabel} />
						<StatPill
							theme={theme}
							icon="play-circle-outline"
							label={`${lessonCount || course.lessonsCount} ${t('course.lessons')}`}
						/>
						{course.level ? (
							<StatPill theme={theme} icon="bar-chart-outline" label={course.level} />
						) : null}
					</View>

					<View style={[styles.displayCard, themedCard(theme)]}>
						<AppText variant="bodyStrong" style={{ color: theme.heading }}>
							{t('payment.included')}
						</AppText>
						{allLessons.length ? (
							allLessons.map((lesson) => (
									<Pressable
										key={lesson.id}
										style={styles.lessonPreviewRow}
										onPress={() => openLesson(lesson)}>
										<Ionicons name="play-circle" size={20} color={theme.accent} />
										<AppText
											variant="small"
											style={[styles.lessonPreviewText, { color: theme.heading }]}>
											{tText(lesson.title, locale)}
										</AppText>
										{lesson.durationSec > 0 ? (
											<AppText variant="small" style={{ color: theme.textMuted }}>
												{Math.max(1, Math.round(lesson.durationSec / 60))}m
											</AppText>
										) : null}
									</Pressable>
							))
						) : (
							<AppText variant="small" style={{ color: theme.textMuted }}>
								{course.lessonsCount} {t('course.lessons')}
							</AppText>
						)}
					</View>
				</View>
			</ScrollView>

			<View
				style={[
					styles.displayFooter,
					{
						paddingBottom: insets.bottom + spacing.sm,
						backgroundColor: theme.surface,
						borderTopColor: theme.progressTrack,
					},
				]}>
				<View>
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{t('payment.total')}
					</AppText>
					{priceLabel.old ? (
						<AppText variant="small" style={[styles.oldPrice, { color: theme.textMuted }]}>
							{priceLabel.old}
						</AppText>
					) : null}
					<AppText variant="h2" style={{ color: theme.heading }}>
						{priceLabel.current}
					</AppText>
				</View>
				<Pressable
					style={[styles.buyButton, { backgroundColor: theme.buttonBg }]}
					onPress={() => void handlePrimaryAction()}>
					<AppText variant="bodyStrong" style={{ color: theme.buttonText }}>
						{course.isEnrolled ? t('common.continue') : t('payment.buyNow')}
					</AppText>
				</Pressable>
			</View>
		</View>
	)
}

function StatPill({
	theme,
	icon,
	label,
}: {
	theme: FigmaTheme
	icon: keyof typeof Ionicons.glyphMap
	label: string
}) {
	return (
		<View style={[styles.statPill, { backgroundColor: theme.notificationCardBg }]}>
			<Ionicons name={icon} size={16} color={theme.accent} />
			<AppText variant="small" style={{ color: theme.heading }}>
				{label}
			</AppText>
		</View>
	)
}

function themedCard(theme: FigmaTheme) {
	return {
		backgroundColor: theme.surface,
		borderColor: theme.notificationCardBg,
		shadowColor: theme.cardShadow,
	}
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	scrollContent: {
		paddingHorizontal: layout.screenPaddingHorizontal,
		paddingBottom: spacing['3xl'],
	},
	tabBody: { marginTop: spacing.lg, gap: spacing.sm },
	lessonsHeading: { marginTop: spacing['2xl'], marginBottom: spacing.sm },
	displayScreen: { flex: 1 },
	displayHero: { height: 300 },
	heroImage: { width: '100%', height: '100%' },
	heroOverlay: {
		...StyleSheet.absoluteFillObject,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: spacing.lg,
	},
	roundButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(255,255,255,0.92)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	displayBody: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
	providerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	providerLogo: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	providerAvatar: {
		width: 44,
		height: 44,
	},
	heroPlayButton: {
		position: 'absolute',
		top: '42%',
		alignSelf: 'center',
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: 'rgba(255,255,255,0.92)',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2,
	},
	oldPrice: {
		textDecorationLine: 'line-through',
		marginTop: 2,
	},
	displayTitle: { marginTop: spacing.lg, fontWeight: '800' },
	displayDesc: { marginTop: spacing.sm, lineHeight: 22 },
	statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
	statPill: {
		minHeight: 38,
		borderRadius: 19,
		paddingHorizontal: spacing.md,
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
	},
	displayCard: {
		marginTop: spacing.lg,
		borderRadius: 14,
		borderWidth: 1,
		padding: spacing.md,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.12,
		shadowRadius: 5,
		elevation: 2,
	},
	lessonPreviewRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginTop: spacing.md,
	},
	lessonPreviewText: { flex: 1 },
	displayFooter: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	buyButton: {
		minWidth: 160,
		height: 52,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
