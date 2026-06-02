import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { enrollCourse, getCourse, getSections } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { formatTime, tText } from '@/lib/localized';
import type { LessonListItemDTO, SectionDTO } from '@/types/dto';

const CATEGORY_COLORS: Record<string, string> = {
  Programming: '#208AEF',
  Language: '#16a34a',
  General: '#9333ea',
  Math: '#ea580c',
  Science: '#0891b2',
};
const colorFor = (cat: string) => CATEGORY_COLORS[cat] ?? '#208AEF';

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { t } = useTranslation();
  const locale = useLocale();

  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((r) => r + 1), []));

  const { data: course, loading: lc } = useAsync(() => getCourse(courseId), [courseId, refresh]);
  const { data: sections, loading: ls } = useAsync(() => getSections(courseId), [courseId, refresh]);

  const [enrolling, setEnrolling] = useState(false);
  const onEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollCourse(courseId);
    } finally {
      setEnrolling(false);
      setRefresh((r) => r + 1);
    }
  };

  if (lc || ls || !course) {
    return (
      <Screen>
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: tText(course.title, locale) }} />

      <View style={[styles.banner, { backgroundColor: colorFor(course.category) }]}>
        <ThemedText style={styles.bannerCat}>
          {course.category} · {course.level}
        </ThemedText>
        <ThemedText style={styles.bannerTitle}>{tText(course.title, locale)}</ThemedText>
        <ThemedText style={styles.bannerMeta}>{course.instructor.fullName}</ThemedText>
      </View>

      <ThemedText style={styles.desc}>{tText(course.description, locale)}</ThemedText>

      {course.isEnrolled ? (
        <ThemedText type="smallBold" style={styles.enrolled}>
          ✅ {t('course.enrolled')}
        </ThemedText>
      ) : (
        <Button title={t('course.enroll')} onPress={onEnroll} loading={enrolling} />
      )}

      {sections?.map((section) => (
        <SectionBlock key={section.id} section={section} enrolled={course.isEnrolled} />
      ))}
    </Screen>
  );
}

function SectionBlock({ section, enrolled }: { section: SectionDTO; enrolled: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">{tText(section.title, locale)}</ThemedText>

      {section.lessons.map((lesson) => (
        <LessonRow key={lesson.id} lesson={lesson} enrolled={enrolled} />
      ))}

      {section.hasQuiz ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/quiz/[sectionId]', params: { sectionId: section.id } })
          }
          style={[styles.quizRow, { borderColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold" style={styles.quizText}>
            📝 {t('course.sectionQuiz')}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

function LessonRow({ lesson, enrolled }: { lesson: LessonListItemDTO; enrolled: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const locked = !lesson.free && !enrolled;

  const icon = locked ? '🔒 ' : lesson.progress?.isCompleted ? '✅ ' : '▶️ ';

  return (
    <Pressable
      disabled={locked}
      onPress={() => router.push({ pathname: '/learn/[lessonId]', params: { lessonId: lesson.id } })}
      style={({ pressed }) => [styles.lessonRow, { opacity: locked ? 0.5 : pressed ? 0.85 : 1 }]}>
      <View style={styles.lessonLeft}>
        <ThemedText>
          {icon}
          {tText(lesson.title, locale)}
        </ThemedText>
        <ThemedText type="small" style={styles.muted}>
          {formatTime(lesson.durationSec)}
          {lesson.free ? ` · ${t('course.free')}` : ''}
          {lesson.progress ? ` · ${lesson.progress.watchedPercent}% ${t('lesson.watched')}` : ''}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 16, padding: Spacing.four, gap: 2 },
  bannerCat: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerTitle: { color: '#ffffff', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  bannerMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  desc: { marginTop: Spacing.one },
  enrolled: { color: '#16a34a' },
  muted: { opacity: 0.7 },
  section: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  lessonRow: { paddingVertical: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.25)' },
  lessonLeft: { gap: 2 },
  quizRow: { marginTop: Spacing.one, borderWidth: 1, borderRadius: 12, padding: Spacing.three, alignItems: 'center' },
  quizText: { color: '#208AEF' },
});
