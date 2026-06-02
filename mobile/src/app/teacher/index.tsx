import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useTeacherDashboard } from '@/hooks/queries';
import { useLocale } from '@/hooks/use-locale';
import { tText } from '@/lib/localized';

export default function TeacherDashboardScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, isLoading, refetch, isRefetching } = useTeacherDashboard();
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Stack.Screen options={{ title: t('role.teacher') }} />
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('dashboard.myCourses')}</ThemedText>
        <LanguageToggle />
      </View>

      <Button
        title={`+ ${t('teacherCreate.createCourse')}`}
        onPress={() => router.push('/teacher/create-course')}
      />

      {isLoading ? (
        <ListSkeleton count={2} />
      ) : data && data.courses.length > 0 ? (
        data.courses.map((c) => (
          <Pressable
            key={c.courseId}
            onPress={() =>
              router.push({ pathname: '/teacher/course/[courseId]', params: { courseId: c.courseId } })
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText style={styles.title}>{tText(c.title, locale)}</ThemedText>
              <ThemedText type="small" style={styles.muted}>
                {c.published ? t('dashboard.published') : t('dashboard.draft')}
              </ThemedText>
              <View style={styles.stats}>
                <Stat label={t('dashboard.students')} value={`${c.studentCount}`} />
                <Stat label={t('dashboard.attempts')} value={`${c.attempts}`} />
                <Stat label={t('dashboard.avgScore')} value={`${c.avgScore}%`} />
              </View>
            </ThemedView>
          </Pressable>
        ))
      ) : (
        <ThemedText style={styles.muted}>{t('dashboard.noData')}</ThemedText>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" style={styles.muted}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  title: { fontSize: 18, fontWeight: '700' },
  muted: { opacity: 0.7 },
  stats: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  stat: { alignItems: 'flex-start' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#208AEF' },
});
