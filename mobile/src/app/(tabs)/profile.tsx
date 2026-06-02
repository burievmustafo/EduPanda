import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getMe } from '@/api/me';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useSession } from '@/store/session-store';

export default function ProfileTab() {
  const { t } = useTranslation();
  const role = useSession((s) => s.role);
  const { data: me, loading } = useAsync(() => getMe(), [role]);

  const roleLabel =
    me?.role === 'teacher'
      ? t('role.teacher')
      : me?.role === 'parent'
        ? t('role.parent')
        : t('role.student');

  return (
    <Screen>
      {loading ? (
        <LoadingState label={t('common.loading')} />
      ) : (
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#ffffff" />
          </View>
          <ThemedText style={styles.name}>{me?.fullName || '—'}</ThemedText>
          {me?.email ? (
            <ThemedText type="small" style={styles.muted}>
              {me.email}
            </ThemedText>
          ) : null}
          <View style={styles.roleBadge}>
            <ThemedText type="smallBold" style={styles.roleText}>
              {roleLabel}
            </ThemedText>
          </View>
        </ThemedView>
      )}

      <Button
        title={t('profile.switchRole')}
        variant="secondary"
        onPress={() => router.replace('/')}
      />

      <ThemedText type="small" style={styles.about}>
        {t('profile.about')}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  name: { fontSize: 20, fontWeight: '700' },
  muted: { opacity: 0.7 },
  roleBadge: {
    marginTop: Spacing.two,
    backgroundColor: 'rgba(32,138,239,0.15)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  roleText: { color: BRAND, textTransform: 'uppercase', letterSpacing: 0.5 },
  about: { opacity: 0.5, textAlign: 'center', marginTop: Spacing.four },
});
