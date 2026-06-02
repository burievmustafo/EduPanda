import { Stack, router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getLesson, saveLessonProgress } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimedQuestionModal } from '@/components/timed-question-modal';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';
import type { LessonDetailDTO, TimedQuestionDTO, WatchedRange } from '@/types/dto';

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
  return <LessonContent lesson={lesson} />;
}

function LessonContent({ lesson }: { lesson: LessonDetailDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();

  const player = useVideoPlayer(lesson.videoUrl, (p) => {
    p.timeUpdateEventInterval = 0.5;
  });

  const [activeQuestion, setActiveQuestion] = useState<TimedQuestionDTO | null>(null);
  const [watchedPercent, setWatchedPercent] = useState(lesson.progress?.watchedPercent ?? 0);

  const activeRef = useRef(false);
  const shownRef = useRef<Set<string>>(new Set());
  const rangesRef = useRef<WatchedRange[]>([]);
  const lastTimeRef = useRef(0);

  // Watched ranges to'plash (faqat oldinga, uzluksiz ko'rilgan qism hisoblanadi).
  function handleTime(currentTime: number) {
    const last = lastTimeRef.current;
    const delta = currentTime - last;
    if (delta > 0 && delta < 1.5) {
      rangesRef.current.push({ start: last, end: currentTime });
    }
    lastTimeRef.current = currentTime;

    // Timed question trigger (DATABASE_AND_API_PLAN.md §6.3): bir savol bir marta.
    if (!activeRef.current) {
      const cand = lesson.timedQuestions.find(
        (c) => currentTime >= c.triggerTimeSec && !shownRef.current.has(c.id)
      );
      if (cand) {
        shownRef.current.add(cand.id);
        activeRef.current = true;
        player.pause();
        setActiveQuestion(cand);
      }
    }
  }

  async function persist() {
    if (rangesRef.current.length === 0) return;
    const ranges = rangesRef.current;
    rangesRef.current = [];
    const res = await saveLessonProgress(lesson.id, {
      watchedRanges: ranges,
      lastPositionSec: lastTimeRef.current,
    });
    setWatchedPercent(res.watchedPercent);
  }

  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => handleTime(currentTime));
    const playSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (!isPlaying) void persist(); // pauza bo'lganda sync (§6.2)
    });
    return () => {
      timeSub.remove();
      playSub.remove();
      void persist(); // screen tark etilganda sync
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  const handleResolved = () => {
    activeRef.current = false;
    setActiveQuestion(null);
    player.play();
  };

  const goToQuiz = () => {
    void persist();
    router.push({ pathname: '/quiz/[sectionId]', params: { sectionId: lesson.sectionId } });
  };

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: tText(lesson.title, locale) }} />

      <View style={styles.videoWrap}>
        <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
      </View>

      <Screen>
        <ThemedText style={styles.title}>{tText(lesson.title, locale)}</ThemedText>

        <ProgressBar percent={watchedPercent} />
        <ThemedText type="small" style={styles.muted}>
          {watchedPercent}% {t('lesson.watched')}
        </ThemedText>

        <ThemedText type="smallBold" style={styles.heading}>
          {t('lesson.transcript')}
        </ThemedText>
        <ThemedText style={styles.muted}>{tText(lesson.content, locale)}</ThemedText>

        <Button title={`📝 ${t('course.sectionQuiz')}`} variant="secondary" onPress={goToQuiz} />
      </Screen>

      <TimedQuestionModal question={activeQuestion} onResolved={handleResolved} />
    </ThemedView>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const theme = useTheme();
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View style={[styles.barBg, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.barFill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000000' },
  video: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  heading: { marginTop: Spacing.two, opacity: 0.8 },
  muted: { opacity: 0.75 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: Spacing.one },
  barFill: { height: 8, borderRadius: 4, backgroundColor: BRAND },
});
