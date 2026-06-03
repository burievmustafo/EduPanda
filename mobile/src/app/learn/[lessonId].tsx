import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getLesson, getSections, saveLessonProgress } from '@/api/learning';
import { LessonVideo, VideoFrame } from '@/components/lesson-video';
import { LoadingState, Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimedQuestionModal } from '@/components/timed-question-modal';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { formatTime, tText } from '@/lib/localized';
import type {
  LessonDetailDTO,
  LessonListItemDTO,
  SectionDTO,
  TimedQuestionDTO,
  WatchedRange,
} from '@/types/dto';

type LessonTab = 'transcript' | 'notes' | 'files';

export default function LearnScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const { data: lesson, loading } = useAsync(() => getLesson(lessonId), [lessonId]);

  if (loading || !lesson) {
    return (
      <Screen>
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }

  return <LessonContent key={lesson.id} lesson={lesson} />;
}

function LessonContent({ lesson }: { lesson: LessonDetailDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const answeredIds = lesson.answeredQuestionIds ?? [];

  const [activeQuestion, setActiveQuestion] = useState<TimedQuestionDTO | null>(null);
  const [videoPaused, setVideoPaused] = useState<boolean | undefined>(undefined);
  const [watchedPercent, setWatchedPercent] = useState(lesson.progress?.watchedPercent ?? 0);
  const [currentTimeSec, setCurrentTimeSec] = useState(lesson.progress?.lastPositionSec ?? 0);
  const [activeTab, setActiveTab] = useState<LessonTab>('transcript');
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; timeSec: number; text: string }>>([]);
  const { data: sections } = useAsync(() => getSections(lesson.courseId), [lesson.courseId, watchedPercent]);

  const activeRef = useRef(false);
  const shownRef = useRef<Set<string>>(new Set(answeredIds));
  const rangesRef = useRef<WatchedRange[]>([]);
  const lastTimeRef = useRef(lesson.progress?.lastPositionSec ?? 0);
  const lastSyncRef = useRef(lesson.progress?.lastPositionSec ?? 0);
  const savingRef = useRef(false);

  const flow = getLearningFlow(sections, lesson, watchedPercent);

  function handleTime(currentTime: number) {
    const canTriggerQuestions = Boolean(lesson.videoUrl) && lesson.durationSec > 0 && currentTime > 0.75;
    const last = lastTimeRef.current;
    const delta = currentTime - last;

    if (delta > 0 && delta < 1.5) {
      rangesRef.current.push({ start: last, end: currentTime });
    }

    lastTimeRef.current = currentTime;
    setCurrentTimeSec(currentTime);

    if (currentTime - lastSyncRef.current >= 15) {
      lastSyncRef.current = currentTime;
      void persist();
    }

    if (canTriggerQuestions && !activeRef.current) {
      const candidate = lesson.timedQuestions.find(
        (question) =>
          question.triggerTimeSec > 0 &&
          currentTime >= question.triggerTimeSec &&
          !shownRef.current.has(question.id)
      );

      if (candidate) {
        shownRef.current.add(candidate.id);
        activeRef.current = true;
        setVideoPaused(true);
        setActiveQuestion(candidate);
      }
    }
  }

  async function persist() {
    if (savingRef.current || rangesRef.current.length === 0) return;

    savingRef.current = true;
    const ranges = rangesRef.current;
    rangesRef.current = [];

    try {
      const result = await saveLessonProgress(lesson.id, {
        watchedRanges: ranges,
        lastPositionSec: lastTimeRef.current,
      });
      setWatchedPercent(result.watchedPercent);
    } finally {
      savingRef.current = false;
    }
  }

  useEffect(() => () => void persist(), []);

  const handleResolved = () => {
    activeRef.current = false;
    setActiveQuestion(null);
    setVideoPaused(false);
  };

  const goToQuiz = () => {
    void persist();
    router.push({ pathname: '/quiz/[sectionId]', params: { sectionId: lesson.sectionId } });
  };

  const goToNext = () => {
    void persist();
    if (!flow.nextItem) return;

    if (flow.nextItem.type === 'lesson') {
      router.push({ pathname: '/learn/[lessonId]', params: { lessonId: flow.nextItem.id } });
    } else {
      router.push({ pathname: '/quiz/[sectionId]', params: { sectionId: flow.nextItem.id } });
    }
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;

    setNotes((prev) => [
      { id: `${Date.now()}`, timeSec: Math.round(lastTimeRef.current), text: noteDraft.trim() },
      ...prev,
    ]);
    setNoteDraft('');
  };

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: tText(lesson.title, locale) }} />

      <View style={styles.videoWrap}>
        <VideoFrame>
          <LessonVideo
            url={lesson.videoUrl}
            paused={videoPaused}
            enableTimeTracking
            onTimeUpdate={handleTime}
            onPause={() => void persist()}
          />
        </VideoFrame>
      </View>

      <Screen>
        <ThemedText style={styles.title}>{tText(lesson.title, locale)}</ThemedText>

        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <View style={styles.statusTop}>
            <ThemedText type="smallBold">
              {flow.completedItems}/{flow.totalItems} {t('lesson.learningItems')}
            </ThemedText>
            <ThemedText type="small" style={styles.muted}>
              {formatTime(currentTimeSec)} / {formatTime(lesson.durationSec)}
            </ThemedText>
          </View>

          <LearningProgressBar
            durationSec={lesson.durationSec}
            currentTimeSec={currentTimeSec}
            watchedPercent={watchedPercent}
            questions={lesson.timedQuestions}
            answeredQuestionIds={answeredIds}
          />

          <View style={styles.statusTop}>
            <ThemedText type="small" style={styles.muted}>
              {watchedPercent}% {t('lesson.watched')}
            </ThemedText>
            <ThemedText type="small" style={{ color: flow.quizUnlocked ? '#16a34a' : '#dc2626' }}>
              {flow.quizUnlocked ? t('lesson.unlockedQuiz') : t('lesson.completeToUnlockQuiz')}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.tabRow}>
          {(['transcript', 'notes', 'files'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <ThemedText type="smallBold" style={activeTab === tab ? styles.tabActiveText : undefined}>
                {t(`lesson.${tab}`)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {activeTab === 'transcript' ? (
          <ThemedView type="backgroundElement" style={styles.panel}>
            <ThemedText type="smallBold">{t('lesson.transcript')}</ThemedText>
            <ThemedText style={styles.muted}>{tText(lesson.content, locale)}</ThemedText>
          </ThemedView>
        ) : null}

        {activeTab === 'notes' ? (
          <ThemedView type="backgroundElement" style={styles.panel}>
            <ThemedText type="smallBold">{t('lesson.addNote')}</ThemedText>
            <TextField placeholder={t('lesson.notePlaceholder')} value={noteDraft} onChangeText={setNoteDraft} multiline />
            <Button title={t('lesson.addNote')} variant="secondary" onPress={addNote} disabled={!noteDraft.trim()} />
            {notes.length > 0 ? (
              notes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => setCurrentTimeSec(note.timeSec)}
                  style={styles.noteItem}>
                  <ThemedText type="smallBold">{formatTime(note.timeSec)}</ThemedText>
                  <ThemedText type="small" style={styles.muted}>
                    {note.text}
                  </ThemedText>
                </Pressable>
              ))
            ) : (
              <ThemedText type="small" style={styles.muted}>
                {t('lesson.noNotes')}
              </ThemedText>
            )}
          </ThemedView>
        ) : null}

        {activeTab === 'files' ? (
          <ThemedView type="backgroundElement" style={styles.panel}>
            <ThemedText type="smallBold">{t('lesson.resources')}</ThemedText>
            <ResourceRow label={t('lesson.lectureVideo')} value={formatTime(lesson.durationSec)} />
            <ResourceRow label={t('lesson.transcriptFile')} value={locale.toUpperCase()} />
            <ResourceRow label={t('lesson.timedQuestions')} value={`${lesson.timedQuestions.length}`} />
          </ThemedView>
        ) : null}

        <View style={styles.actions}>
          <Button
            title={flow.nextItem?.type === 'lesson' ? t('lesson.nextLesson') : t('lesson.nextItem')}
            onPress={goToNext}
            disabled={!flow.nextItem || (flow.nextItem.type === 'quiz' && !flow.quizUnlocked)}
            style={styles.actionButton}
          />
          <Button
            title={t('course.sectionQuiz')}
            variant="secondary"
            onPress={goToQuiz}
            disabled={!flow.quizUnlocked}
            style={styles.actionButton}
          />
        </View>
      </Screen>

      <TimedQuestionModal question={activeQuestion} onResolved={handleResolved} />
    </ThemedView>
  );
}

function LearningProgressBar({
  durationSec,
  currentTimeSec,
  watchedPercent,
  questions,
  answeredQuestionIds,
}: {
  durationSec: number;
  currentTimeSec: number;
  watchedPercent: number;
  questions: TimedQuestionDTO[];
  answeredQuestionIds: string[];
}) {
  const theme = useTheme();
  const watched = Math.min(100, Math.max(0, watchedPercent));
  const current = durationSec > 0 ? Math.min(100, Math.max(0, (currentTimeSec / durationSec) * 100)) : 0;

  return (
    <View style={[styles.barBg, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.barFill, { width: `${watched}%` }]} />
      <View style={[styles.playhead, { left: `${current}%` }]} />
      {questions.map((question) => {
        const left =
          durationSec > 0 ? Math.min(100, Math.max(0, (question.triggerTimeSec / durationSec) * 100)) : 0;
        const answered = answeredQuestionIds.includes(question.id);

        return (
          <View
            key={question.id}
            style={[
              styles.questionMarker,
              { left: `${left}%`, backgroundColor: answered ? '#16a34a' : '#f59e0b' },
            ]}
          />
        );
      })}
    </View>
  );
}

function ResourceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resourceRow}>
      <ThemedText>{label}</ThemedText>
      <ThemedText type="small" style={styles.muted}>
        {value}
      </ThemedText>
    </View>
  );
}

function getLearningFlow(sections: SectionDTO[] | undefined, lesson: LessonDetailDTO, watchedPercent: number) {
  const allLessons: LessonListItemDTO[] = sections?.flatMap((section) => section.lessons) ?? [];
  const totalLessons = allLessons.length || 1;
  const completedLessons = allLessons.filter((item) =>
    item.id === lesson.id ? watchedPercent >= 90 || Boolean(item.progress?.isCompleted) : Boolean(item.progress?.isCompleted)
  ).length;
  const currentSection = sections?.find((section) => section.id === lesson.sectionId);
  const sectionLessons = currentSection?.lessons ?? [];
  const currentIndex = sectionLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = currentIndex >= 0 ? sectionLessons[currentIndex + 1] : undefined;
  const quizUnlocked = sectionLessons.length
    ? sectionLessons.every((item) =>
        item.id === lesson.id ? watchedPercent >= 90 || Boolean(item.progress?.isCompleted) : Boolean(item.progress?.isCompleted)
      )
    : watchedPercent >= 90;
  const nextItem = nextLesson
    ? { type: 'lesson' as const, id: nextLesson.id }
    : currentSection?.hasQuiz
      ? { type: 'quiz' as const, id: currentSection.id }
      : undefined;

  return {
    totalItems: totalLessons + (sections?.filter((section) => section.hasQuiz).length ?? 0),
    completedItems: completedLessons,
    quizUnlocked,
    nextItem,
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000000' },
  video: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  statusCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  muted: { opacity: 0.75 },
  barBg: { height: 10, borderRadius: 5, marginTop: Spacing.one, position: 'relative' },
  barFill: { height: 10, borderRadius: 5, backgroundColor: BRAND },
  playhead: { position: 'absolute', top: -3, width: 2, height: 16, backgroundColor: '#ffffff' },
  questionMarker: {
    position: 'absolute',
    top: -4,
    width: 10,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  tabRow: { flexDirection: 'row', gap: Spacing.two },
  tab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  tabActive: { backgroundColor: 'rgba(32,138,239,0.18)' },
  tabActiveText: { color: BRAND },
  panel: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  noteItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
    paddingTop: Spacing.two,
    gap: 2,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
    paddingTop: Spacing.two,
  },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1 },
});
