import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { createStudentInviteCode } from '@/api/me';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Brand, Radius, Shadow, Spacing } from '@/constants/theme';
import { useMe, useStudentDashboard } from '@/hooks/queries';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/store/session-store';

export default function ProfileTab() {
  const { t } = useTranslation();
  const role = useSession((s) => s.role);
  const theme = useTheme();
  const { data: me, isLoading } = useMe();
  const { data: dashboard } = useStudentDashboard();

  const [inviteCode, setInviteCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const roleLabel =
    role === 'teacher' ? t('role.teacher') : role === 'parent' ? t('role.parent') : t('role.student');

  const completedLessons = dashboard?.inProgress.reduce((s, c) => s + c.completedLessons, 0) ?? 0;
  const totalAttempts = dashboard?.recentAttempts.length ?? 0;

  return (
    <Screen>
      {/* Settings button */}
      <View style={styles.topRow}>
        <ThemedText style={styles.pageTitle}>Profile</ThemedText>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      {!isLoading && (
        <>
          {/* Avatar + info */}
          <ThemedView style={[styles.card, Shadow.sm, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: Brand.primary }]}>
                <ThemedText style={styles.avatarLetter}>
                  {(me?.fullName?.[0] ?? '?').toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.info}>
                <ThemedText style={styles.name}>{me?.fullName || '—'}</ThemedText>
                <ThemedText style={styles.email}>{me?.email || ''}</ThemedText>
                <View style={[styles.roleBadge, { backgroundColor: Brand.primaryLight }]}>
                  <ThemedText style={[styles.roleText, { color: Brand.primary }]}>
                    {roleLabel.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Stats */}
            {role === 'student' && (
              <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
                <Stat label="Lessons done" value={`${completedLessons}`} />
                <StatDivider />
                <Stat label="Quiz attempts" value={`${totalAttempts}`} />
                <StatDivider />
                <Stat label="Courses" value={`${dashboard?.inProgress.length ?? 0}`} />
              </View>
            )}
          </ThemedView>

          {/* Invite code (student only) */}
          {role === 'student' && (
            <ThemedView style={[styles.inviteCard, { backgroundColor: theme.backgroundCard }]}>
              <ThemedText style={styles.inviteTitle}>{t('profile.inviteCode')}</ThemedText>
              <ThemedText style={styles.inviteHint}>{t('profile.shareCode')}</ThemedText>
              {inviteCode ? (
                <ThemedText style={[styles.codeText, { color: Brand.primary }]}>{inviteCode}</ThemedText>
              ) : null}
              <Button
                title={t('profile.generateInviteCode')}
                variant="secondary"
                loading={inviteLoading}
                onPress={async () => {
                  setInviteLoading(true);
                  try {
                    const res = await createStudentInviteCode();
                    setInviteCode(res.code);
                  } finally {
                    setInviteLoading(false);
                  }
                }}
              />
            </ThemedView>
          )}

          {/* Switch role */}
          <Button
            title={t('profile.switchRole')}
            variant="ghost"
            onPress={() => router.replace('/')}
          />

          <ThemedText style={styles.about}>{t('profile.about')}</ThemedText>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function StatDivider() {
  const theme = useTheme();
  return <View style={[styles.statDivider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  settingsBtn: { padding: 4 },
  card: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.two },
  avatarRow: { flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, alignItems: 'center' },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: '800', color: '#fff' },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 13, opacity: 0.6 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill, marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.two },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: BRAND },
  statLabel: { fontSize: 11, opacity: 0.6 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  inviteCard: { borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.two, marginBottom: Spacing.two },
  inviteTitle: { fontSize: 16, fontWeight: '700' },
  inviteHint: { fontSize: 13, opacity: 0.65 },
  codeText: { fontSize: 36, fontWeight: '800', letterSpacing: 5, textAlign: 'center', paddingVertical: Spacing.two },
  about: { opacity: 0.4, textAlign: 'center', marginTop: Spacing.four, fontSize: 12 },
});
