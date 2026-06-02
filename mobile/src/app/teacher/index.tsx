import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getTeacherDashboard } from '@/api/dashboards';
import { LanguageToggle } from '@/components/language-toggle';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { tText } from '@/lib/localized';

export default function TeacherDashboardScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, loading } = useAsync(() => getTeacherDashboard(), []);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('role.teacher') }} />
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('dashboard.myCourses')}</ThemedText>
        <LanguageToggle />
      </View>

      {loading ? (
        <LoadingState label={t('common.loading')} />
      ) : data && data.courses.length > 0 ? (
        data.courses.map((c) => (
          <ThemedView key={c.courseId} type="backgroundElement" style={styles.card}>
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
