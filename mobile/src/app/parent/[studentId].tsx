import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getChildProgress } from '@/api/dashboards';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';

export default function ChildProgressScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, loading } = useAsync(() => getChildProgress(studentId), [studentId]);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('dashboard.progress') }} />

      {loading ? (
        <LoadingState label={t('common.loading')} />
      ) : data ? (
        <>
          <ThemedText type="smallBold" style={styles.heading}>
            {t('dashboard.progress')}
          </ThemedText>
          {data.byCourse.length > 0 ? (
            data.byCourse.map((c) => (
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
                <ThemedText
                  type="smallBold"
                  style={{ color: a.passed ? '#16a34a' : '#dc2626' }}>
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
