import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui-button';
import { LanguageToggle } from '@/components/language-toggle';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/store/session-store';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const setRole = useSession((s) => s.setRole);

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
          <Button
            title={t('role.student')}
            onPress={() => {
              setRole('student');
              router.push('/home');
            }}
          />
          <Button
            title={t('role.teacher')}
            variant="secondary"
            onPress={() => {
              setRole('teacher');
              router.push('/teacher');
            }}
          />
          <Button
            title={t('role.parent')}
            variant="secondary"
            onPress={() => {
              setRole('parent');
              router.push('/parent');
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { gap: Spacing.three, marginTop: Spacing.five },
  muted: { opacity: 0.7 },
  buttons: { gap: Spacing.two, marginTop: Spacing.three },
});
