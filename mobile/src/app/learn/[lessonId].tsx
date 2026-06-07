import { Ionicons } from '@expo/vector-icons'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { completeLesson, saveLessonProgress } from '@/api/learning'
import {
	LearningVideoPlayerShell,
	LessonBottomNavigation,
	LessonTabs,
	NoteEditorSheet,
	NotesPanel,
	type LessonNote,
	type LessonPanelTab,
} from '@/components/lesson'
import { TimedQuestionModal } from '@/components/timed-question-modal'
import { ListSkeleton } from '@/components/skeleton'
import { AppCard } from '@/components/ui/app-card'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { layout, radius, spacing } from '@/design/tokens'
import { useQueryClient } from '@tanstack/react-query'

import { AppButton } from '@/components/ui/app-button'
import { useLesson, useSections } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { getLearningFlow } from '@/lib/lesson-flow'
import { formatTime, tText } from '@/lib/localized'
import { stripHtml } from '@/lib/strip-html'
import { loadLessonNotes, persistLessonNotes } from '@/store/lesson-notes-store'
import type { LessonDetailDTO, TimedQuestionDTO, WatchedRange } from '@/types/dto'

export default function LearnScreen() {
	const { lessonId } = useLocalSearchParams<{ lessonId: string }>()
	const { t } = useTranslation()
	const { data: lesson, isLoading } = useLesson(lessonId)

	if (isLoading || !lesson) {
		return (
			<View style={styles.loading}>
				<ListSkeleton count={2} />
			</View>
		)
	}

	return <LessonPlayer key={lesson.id} lesson={lesson} />
}

function LessonPlayer({ lesson }: { lesson: LessonDetailDTO }) {
	const { t } = useTranslation()
	const locale = useLocale()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const [activeQuestion, setActiveQuestion] = useState<TimedQuestionDTO | null>(null)
	const [videoPaused, setVideoPaused] = useState<boolean | undefined>(undefined)
	const [watchedPercent, setWatchedPercent] = useState(lesson.progress?.watchedPercent ?? 0)
	const [seekToSec, setSeekToSec] = useState<number | undefined>(undefined)
	const [activeTab, setActiveTab] = useState<LessonPanelTab>('overview')
	const [noteDraft, setNoteDraft] = useState('')
	const [notes, setNotes] = useState<LessonNote[]>([])
	const [noteSheetOpen, setNoteSheetOpen] = useState(false)
	const [isCompleted, setIsCompleted] = useState(lesson.progress?.isCompleted ?? false)
	const [completing, setCompleting] = useState(false)
	const playbackRate = 1

	const queryClient = useQueryClient()
	const { data: sections } = useSections(lesson.courseId)

	const activeRef = useRef(false)
	const shownRef = useRef<Set<string>>(new Set())
	const rangesRef = useRef<WatchedRange[]>([])
	const lastTimeRef = useRef(lesson.progress?.lastPositionSec ?? 0)
	const lastSyncRef = useRef(lesson.progress?.lastPositionSec ?? 0)
	const savingRef = useRef(false)

	const flow = getLearningFlow(sections, lesson, watchedPercent)
	const bottomPad = layout.tabBarHeight + Math.max(insets.bottom, spacing.md) + spacing.lg
	const lessonTitle = tText(lesson.title, locale) || t('lesson.untitledLesson')
	const sectionTitle = flow.sectionTitle ? tText(flow.sectionTitle, locale) : ''
	const lessonContent = stripHtml(tText(lesson.content, locale))

	const panelTabs = useMemo(
		() => [
			{ key: 'overview' as const, label: t('lesson.overview') },
			{ key: 'notes' as const, label: t('lesson.notes') },
		],
		[t],
	)

	function handleTime(currentTime: number) {
		const canTriggerQuestions =
			Boolean(lesson.videoUrl) && lesson.durationSec > 0 && currentTime > 0.75
		const last = lastTimeRef.current
		const delta = currentTime - last

		if (delta > 0 && delta < 1.5) {
			rangesRef.current.push({ start: last, end: currentTime })
		}

		lastTimeRef.current = currentTime

		if (currentTime - lastSyncRef.current >= 15) {
			lastSyncRef.current = currentTime
			void persist()
		}

		if (canTriggerQuestions && !activeRef.current) {
			const candidate = lesson.timedQuestions
				.filter(
					(question) =>
						question.triggerTimeSec > 0 &&
						currentTime >= question.triggerTimeSec &&
						!shownRef.current.has(question.id),
				)
				.sort((a, b) => a.triggerTimeSec - b.triggerTimeSec)[0]

			if (candidate) {
				shownRef.current.add(candidate.id)
				activeRef.current = true
				setVideoPaused(true)
				setActiveQuestion(candidate)
			}
		}
	}

	async function persist() {
		if (savingRef.current || rangesRef.current.length === 0) return

		savingRef.current = true
		const ranges = rangesRef.current
		rangesRef.current = []

		try {
			const result = await saveLessonProgress(lesson.id, {
				watchedRanges: ranges,
				lastPositionSec: lastTimeRef.current,
			})
			setWatchedPercent(result.watchedPercent)
		} finally {
			savingRef.current = false
		}
	}

	useEffect(() => () => void persist(), [])

	useEffect(() => {
		shownRef.current = new Set()
		activeRef.current = false
		setActiveQuestion(null)
		setVideoPaused(undefined)
	}, [lesson.id])

	useEffect(() => {
		let active = true
		void loadLessonNotes(lesson.id).then((saved) => {
			if (active) setNotes(saved)
		})
		return () => {
			active = false
		}
	}, [lesson.id])

	const handleResolved = () => {
		activeRef.current = false
		setActiveQuestion(null)
		setVideoPaused(false)
	}

	const seek = (timeSec: number) => {
		setSeekToSec(timeSec)
		lastTimeRef.current = timeSec
		setTimeout(() => setSeekToSec(undefined), 300)
	}

	const navigateNext = (nextFlow: ReturnType<typeof getLearningFlow>) => {
		if (!nextFlow.nextItem) return
		if (nextFlow.nextItem.type === 'lesson') {
			router.push({ pathname: '/learn/[lessonId]', params: { lessonId: nextFlow.nextItem.id } })
		} else {
			router.push({ pathname: '/quiz/[sectionId]', params: { sectionId: nextFlow.nextItem.id } })
		}
	}

	const goToNext = () => {
		void persist()
		navigateNext(flow)
	}

	const handleCompleteLesson = async () => {
		if (isCompleted || completing) return
		setCompleting(true)
		try {
			await persist()
			const result = await completeLesson(lesson.id)
			setIsCompleted(result.isCompleted)
			setWatchedPercent((prev) => Math.max(prev, result.watchedPercent))
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['lesson', lesson.id] }),
				queryClient.invalidateQueries({ queryKey: ['sections', lesson.courseId] }),
				queryClient.invalidateQueries({ queryKey: ['studentDashboard'] }),
			])
			navigateNext(getLearningFlow(sections, lesson, 100))
		} finally {
			setCompleting(false)
		}
	}

	const saveNote = () => {
		if (!noteDraft.trim()) return
		const next: LessonNote[] = [
			{ id: `${Date.now()}`, timeSec: Math.round(lastTimeRef.current), text: noteDraft.trim() },
			...notes,
		]
		setNotes(next)
		void persistLessonNotes(lesson.id, next)
		setNoteDraft('')
		setNoteSheetOpen(false)
		setActiveTab('notes')
	}

	const nextDisabled =
		!flow.nextItem || (flow.nextItem.type === 'quiz' && !flow.quizUnlocked)

	return (
		<View style={[styles.root, { backgroundColor: theme.background }]}>
			<Stack.Screen
				options={{
					title: lessonTitle,
					headerStyle: { backgroundColor: theme.background },
					headerTintColor: theme.heading,
					headerShadowVisible: false,
				}}
			/>

			<LearningVideoPlayerShell
				url={lesson.videoUrl}
				paused={videoPaused}
				enableTimeTracking={Boolean(lesson.videoUrl)}
				seekToSec={seekToSec}
				playbackRate={playbackRate}
				onTimeUpdate={handleTime}
				onPause={() => void persist()}
			/>

			<ScrollView
				contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
				keyboardShouldPersistTaps="handled">
				<View style={styles.titleBlock}>
					<View style={styles.titleRow}>
						<View style={styles.titleTextCol}>
							<AppText variant="h2" style={{ color: theme.heading }}>
								{lessonTitle}
							</AppText>
							{sectionTitle ? (
								<AppText variant="body" style={{ color: theme.textMuted }}>
									{sectionTitle}
								</AppText>
							) : null}
						</View>
						<AppButton
							title={
								isCompleted ? t('lesson.completed') : t('lesson.completeLesson')
							}
							onPress={() => void handleCompleteLesson()}
							loading={completing}
							disabled={isCompleted}
							fullWidth={false}
							compact
							style={styles.completeBtn}
						/>
					</View>
				</View>

				<LessonTabs tabs={panelTabs} active={activeTab} onChange={setActiveTab} />

				{activeTab === 'overview' ? (
					<AppCard
						style={[
							styles.overviewCard,
							{
								backgroundColor: theme.surface,
								borderColor: theme.cardBorder,
							},
						]}>
						<AppText variant="bodyStrong" style={{ color: theme.heading }}>
							{t('course.aboutCourse')}
						</AppText>
						<AppText variant="body" style={[styles.overviewText, { color: theme.textMuted }]}>
							{lessonContent || t('lesson.noOverview')}
						</AppText>
						<View style={styles.metaGrid}>
							<LessonMetaPill
								label={t('lesson.lectureVideo')}
								value={formatTime(lesson.durationSec)}
								icon="play-circle-outline"
							/>
							<LessonMetaPill
								label={t('lesson.timedQuestions')}
								value={`${lesson.timedQuestions.length}`}
								icon="help-circle-outline"
							/>
							<LessonMetaPill
								label={t('lesson.watched')}
								value={isCompleted ? t('lesson.completed') : `${watchedPercent}%`}
								icon="checkmark-circle-outline"
							/>
						</View>
					</AppCard>
				) : null}

				{activeTab === 'notes' ? (
					<NotesPanel
						notes={notes}
						emptyTitle={t('lesson.noNotes')}
						emptyDescription={t('lesson.noNotesHint')}
						onSeekNote={seek}
					/>
				) : null}
			</ScrollView>

			<View style={styles.bottomFixed}>
				<LessonBottomNavigation
					backLabel={t('common.back')}
					noteLabel={t('lesson.notes')}
					nextLabel={
						flow.nextItem?.type === 'lesson'
							? t('lesson.nextLesson')
							: t('lesson.nextItem')
					}
					onBack={() => {
						void persist()
						router.back()
					}}
					onNote={() => setNoteSheetOpen(true)}
					onNext={goToNext}
					nextDisabled={nextDisabled}
				/>
			</View>

			<TimedQuestionModal question={activeQuestion} onResolved={handleResolved} />
			<NoteEditorSheet
				visible={noteSheetOpen}
				timeSec={Math.round(lastTimeRef.current)}
				value={noteDraft}
				onChangeText={setNoteDraft}
				onSave={saveNote}
				onClose={() => setNoteSheetOpen(false)}
			/>
		</View>
	)
}

function LessonMetaPill({
	label,
	value,
	icon,
}: {
	label: string
	value: string
	icon: keyof typeof Ionicons.glyphMap
}) {
	const theme = useFigmaTheme()

	return (
		<View style={[styles.metaPill, { backgroundColor: theme.notificationCardBg }]}>
			<AppText variant="small" style={{ color: theme.textMuted }}>
				{label}
			</AppText>
			<View style={styles.metaValueRow}>
				<Ionicons name={icon} size={16} color={theme.accent} />
				<AppText variant="captionStrong" style={{ color: theme.heading }}>
					{value}
				</AppText>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	loading: {
		flex: 1,
		paddingHorizontal: layout.screenPaddingHorizontal,
		paddingTop: spacing['2xl'],
	},
	scroll: {
		paddingHorizontal: layout.screenPaddingHorizontal,
		paddingTop: spacing['2xl'],
		gap: spacing.lg,
	},
	titleBlock: { gap: spacing.xs },
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.sm,
	},
	titleTextCol: { flex: 1, gap: spacing.xs },
	completeBtn: { flexShrink: 0 },
	overviewCard: { gap: spacing.md, borderRadius: radius.xl },
	overviewText: { lineHeight: 23 },
	metaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
		marginTop: spacing.xs,
	},
	metaPill: {
		minWidth: '47%',
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.xs,
	},
	metaValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
	bottomFixed: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
})
