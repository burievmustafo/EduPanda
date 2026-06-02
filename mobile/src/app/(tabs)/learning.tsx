import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useStudentDashboard } from '@/hooks/queries';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';

export default function LearningTab() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, isLoading, refetch, isRefetching } = useStudentDashboard();
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      {isLoading ? (
        <ListSkeleton count={2} />
      ) : data ? (
        <>
          <ThemedText type="smallBold" style={styles.heading}>
            {t('dashboard.progress')}
          </ThemedText>
          {data.inProgress.length > 0 ? (
            data.inProgress.map((c) => (
              <ThemedView key={c.courseId} type="backgroundElement" style={styles.card}>
                <ThemedText style={styles.title}>{tText(c.title, locale)}</ThemedText>
                <ProgressBar percent={c.percent} />
                <ThemedText type="small" style={styles.muted}>
                  {c.completedLessons}/{c.totalLessons} {t('dashboard.lessons')} · {c.percent}%
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.muted}>{t('dashboard.noData')}</ThemedText>
          )}

          <ThemedText type="smallBold" style={styles.heading}>
            {t('dashboard.recentResults')}
          </ThemedText>
          {data.recentAttempts.length > 0 ? (
            data.recentAttempts.map((a) => (
              <ThemedView key={a.attemptId} type="backgroundElement" style={styles.attemptRow}>
                <ThemedText style={styles.flex} numberOfLines={1}>
                  {tText(a.quizTitle, locale)}
                </ThemedText>
                <ThemedText type="smallBold" style={{ color: a.passed ? '#16a34a' : '#dc2626' }}>
                  {a.score}% {a.passed ? '✅' : '❌'}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.muted}>{t('dashboard.noData')}</ThemedText>
          )}
        </>
      ) : (
        <ThemedText style={styles.muted}>{t('dashboard.noData')}</ThemedText>
      )}
    </Screen>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const theme = useTheme();
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View style={[styles.barBg, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.barFill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: Spacing.two, opacity: 0.8 },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one },
  title: { fontSize: 16, fontWeight: '700' },
  muted: { opacity: 0.7 },
  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
  },
  flex: { flex: 1 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 2 },
  barFill: { height: 8, borderRadius: 4, backgroundColor: BRAND },
});
