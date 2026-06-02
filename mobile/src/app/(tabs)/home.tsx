import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCourses } from '@/hooks/queries';
import { useLocale } from '@/hooks/use-locale';
import { tText } from '@/lib/localized';
import type { CourseDTO } from '@/types/dto';

export default function HomeTab() {
  const { t } = useTranslation();
  const { data: courses, isLoading, refetch, isRefetching } = useCourses();
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <ThemedText type="subtitle">{t('home.greeting')} 👋</ThemedText>
      <ThemedText type="smallBold" style={styles.section}>
        {t('home.allCourses')}
      </ThemedText>

      {isLoading ? (
        <ListSkeleton />
      ) : courses && courses.length > 0 ? (
        courses.map((c) => <CourseCard key={c.id} course={c} />)
      ) : (
        <ThemedText style={styles.muted}>{t('home.noCourses')}</ThemedText>
      )}
    </Screen>
  );
}

function CourseCard({ course }: { course: CourseDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/course/[courseId]', params: { courseId: course.id } })}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" style={styles.category}>
          {course.category} · {course.level}
        </ThemedText>
        <ThemedText style={styles.title}>{tText(course.title, locale)}</ThemedText>
        <ThemedText type="small" style={styles.muted} numberOfLines={2}>
          {tText(course.description, locale)}
        </ThemedText>
        <ThemedText type="small" style={styles.meta}>
          {course.sectionsCount} {t('course.sections')} · {course.lessonsCount} {t('course.lessons')}
          {course.isEnrolled ? ` · ✅ ${t('course.enrolled')}` : ''}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.two, opacity: 0.8 },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  category: { color: '#208AEF', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  meta: { opacity: 0.7, marginTop: Spacing.one },
  muted: { opacity: 0.75 },
});
