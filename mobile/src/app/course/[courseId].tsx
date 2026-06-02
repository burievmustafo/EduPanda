import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getCourse, getSections } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { formatTime, tText } from '@/lib/localized';
import type { LessonListItemDTO, SectionDTO } from '@/types/dto';

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: course, loading: lc } = useAsync(() => getCourse(courseId), [courseId]);
  const { data: sections, loading: ls } = useAsync(() => getSections(courseId), [courseId]);

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

      <ThemedText type="smallBold" style={styles.category}>
        {course.category} · {course.level}
      </ThemedText>
      <ThemedText style={styles.title}>{tText(course.title, locale)}</ThemedText>
      <ThemedText type="small" style={styles.muted}>
        {course.instructor.fullName}
      </ThemedText>
      <ThemedText style={styles.desc}>{tText(course.description, locale)}</ThemedText>

      {sections?.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </Screen>
  );
}

function SectionBlock({ section }: { section: SectionDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">{tText(section.title, locale)}</ThemedText>

      {section.lessons.map((lesson) => (
        <LessonRow key={lesson.id} lesson={lesson} />
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

function LessonRow({ lesson }: { lesson: LessonListItemDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/learn/[lessonId]', params: { lessonId: lesson.id } })}
      style={({ pressed }) => [styles.lessonRow, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.lessonLeft}>
        <ThemedText>
          {lesson.progress?.isCompleted ? '✅ ' : '▶️ '}
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
  category: { color: '#208AEF', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  desc: { marginTop: Spacing.one, marginBottom: Spacing.two },
  muted: { opacity: 0.7 },
  section: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  lessonRow: { paddingVertical: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.25)' },
  lessonLeft: { gap: 2 },
  quizRow: { marginTop: Spacing.one, borderWidth: 1, borderRadius: 12, padding: Spacing.three, alignItems: 'center' },
  quizText: { color: '#208AEF' },
});
