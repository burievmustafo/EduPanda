import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Shadow, Spacing } from '@/constants/theme';
import { useCourses, useStudentDashboard } from '@/hooks/queries';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';
import type { CourseDTO } from '@/types/dto';

const CAT_COLORS: Record<string, string> = {
  Programming: Brand.primary,
  Language: Brand.success,
  General: '#9333ea',
  Math: Brand.warning,
  Science: '#0891b2',
};
const catColor = (c: string) => CAT_COLORS[c] ?? Brand.primary;

export default function HomeTab() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: courses, isLoading, refetch, isRefetching } = useCourses();
  const { data: dashboard } = useStudentDashboard();
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  const enrolled = courses?.filter((c) => c.isEnrolled) ?? [];
  const discover = courses?.filter((c) => !c.isEnrolled) ?? [];
  const inProgress = dashboard?.inProgress ?? [];

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.greeting}>{t('home.greeting')} 👋</ThemedText>
        <ThemedText style={styles.appName}>EduPanda</ThemedText>
      </View>

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <>
          {/* Continue learning */}
          {enrolled.length > 0 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('home.continueLearning')}</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rail}>
                {enrolled.map((c) => {
                  const prog = inProgress.find((p) => p.courseId === c.id);
                  return <ContinueCard key={c.id} course={c} percent={prog?.percent ?? 0} />;
                })}
              </ScrollView>
            </>
          )}

          {/* Discover */}
          {discover.length > 0 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('home.allCourses')}</ThemedText>
              {discover.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </>
          )}

          {courses?.length === 0 && (
            <ThemedText style={styles.muted}>{t('home.noCourses')}</ThemedText>
          )}
        </>
      )}
    </Screen>
  );
}

function ContinueCard({ course, percent }: { course: CourseDTO; percent: number }) {
  const locale = useLocale();
  const theme = useTheme();
  const color = catColor(course.category);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/course/[courseId]', params: { courseId: course.id } })}
      style={({ pressed }) => [styles.continueCard, Shadow.md, { backgroundColor: theme.backgroundCard, opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.continueTop, { backgroundColor: color }]}>
        <ThemedText style={styles.continueCat}>{course.category}</ThemedText>
      </View>
      <View style={styles.continueBody}>
        <ThemedText style={styles.continueTitle} numberOfLines={2}>
          {tText(course.title, locale)}
        </ThemedText>
        <View style={[styles.progressBg, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
        <ThemedText style={[styles.continuePct, { color }]}>{percent}% complete</ThemedText>
      </View>
    </Pressable>
  );
}

function CourseCard({ course }: { course: CourseDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const color = catColor(course.category);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/course/[courseId]', params: { courseId: course.id } })}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <ThemedView style={[styles.card, Shadow.sm, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.cardStripe, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <ThemedText style={[styles.category, { color }]}>
            {course.category.toUpperCase()} · {course.level.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.title} numberOfLines={2}>
            {tText(course.title, locale)}
          </ThemedText>
          <ThemedText style={styles.desc} numberOfLines={2}>
            {tText(course.description, locale)}
          </ThemedText>
          <ThemedText style={styles.meta}>
            {course.sectionsCount} {t('course.sections')} · {course.lessonsCount} {t('course.lessons')}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.two },
  greeting: { fontSize: 14, opacity: 0.65, fontWeight: '500' },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.three, marginBottom: Spacing.two },
  rail: { marginHorizontal: -Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.one },
  // Continue card
  continueCard: { width: 220, borderRadius: Radius.lg, marginRight: Spacing.two, overflow: 'hidden' },
  continueTop: { height: 80, justifyContent: 'flex-end', padding: Spacing.two },
  continueCat: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  continueBody: { padding: Spacing.two, gap: 6 },
  continueTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  progressBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  continuePct: { fontSize: 12, fontWeight: '600' },
  // Discover card
  card: { borderRadius: Radius.lg, flexDirection: 'row', overflow: 'hidden', marginBottom: Spacing.one },
  cardStripe: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.three, gap: 4 },
  category: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 23 },
  desc: { fontSize: 13, opacity: 0.65, lineHeight: 18 },
  meta: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  muted: { opacity: 0.6, textAlign: 'center', marginTop: Spacing.four },
});
