import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { getCourses } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { tText } from '@/lib/localized';
import type { CourseDTO } from '@/types/dto';

export default function HomeTab() {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((r) => r + 1), []));
  const { data: courses, loading } = useAsync(() => getCourses(), [refresh]);

  return (
    <Screen>
      <ThemedText type="subtitle">{t('home.greeting')} 👋</ThemedText>
      <ThemedText type="smallBold" style={styles.section}>
        {t('home.allCourses')}
      </ThemedText>

      {loading ? (
        <LoadingState label={t('common.loading')} />
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
