import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { setMyRole } from '@/api/me';
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/store/session-store';
import type { UserRole } from '@/types/dto';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const setRole = useSession((s) => s.setRole);

  const handlePick = async (role: UserRole, path: '/home' | '/teacher' | '/parent') => {
    setRole(role); // lokal (dev fallback)
    try {
      await setMyRole(role); // backend (real user roli)
    } catch {
      // ignore — navigatsiya baribir davom etadi
    }
    router.push(path);
  };

  return (
    <Screen edgesTop>
      <View style={styles.header}>
        <ThemedText type="title">EduPanda</ThemedText>
        <LanguageToggle />
      </View>

      <View style={styles.body}>
        <ThemedText type="subtitle">{t('role.chooseRole')}</ThemedText>
        <ThemedText type="small" style={styles.muted}>
          {t('role.subtitle')}
        </ThemedText>

        <View style={styles.buttons}>
          <Button title={t('role.student')} onPress={() => handlePick('student', '/home')} />
          <Button
            title={t('role.teacher')}
            variant="secondary"
            onPress={() => handlePick('teacher', '/teacher')}
          />
          <Button
            title={t('role.parent')}
            variant="secondary"
            onPress={() => handlePick('parent', '/parent')}
          />
        </View>

        <Button title={t('auth.signOut')} variant="ghost" onPress={() => signOut()} style={styles.signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { gap: Spacing.three, marginTop: Spacing.five },
  muted: { opacity: 0.7 },
  buttons: { gap: Spacing.two, marginTop: Spacing.three },
  signOut: { marginTop: Spacing.four },
});
