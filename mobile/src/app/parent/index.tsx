import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useParentDashboard } from '@/hooks/queries';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, isRefetching } = useParentDashboard();
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Stack.Screen options={{ title: t('role.parent') }} />
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('dashboard.myChildren')}</ThemedText>
        <LanguageToggle />
      </View>

      {isLoading ? (
        <ListSkeleton count={2} />
      ) : data && data.children.length > 0 ? (
        data.children.map((ch) => (
          <Pressable
            key={ch.studentId}
            onPress={() =>
              router.push({ pathname: '/parent/[studentId]', params: { studentId: ch.studentId } })
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText style={styles.name}>{ch.fullName}</ThemedText>
              <View style={styles.stats}>
                <Stat label={t('dashboard.avgScore')} value={`${ch.avgScore}%`} />
                <Stat label={t('dashboard.attempts')} value={`${ch.attempts}`} />
                <Stat label={t('dashboard.completedLessons')} value={`${ch.completedLessons}`} />
              </View>
              <ThemedText type="small" style={styles.link}>
                {t('dashboard.viewProgress')} →
              </ThemedText>
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
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  name: { fontSize: 18, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: Spacing.four },
  stat: { alignItems: 'flex-start' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#208AEF' },
  muted: { opacity: 0.7 },
  link: { color: '#208AEF', marginTop: Spacing.one },
});
