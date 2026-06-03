import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { linkParentChild } from '@/api/me';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function AddChildScreen() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedName, setLinkedName] = useState('');

  const onLink = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setLinkedName('');
    try {
      const res = await linkParentChild(code.trim());
      setLinkedName(res.fullName);
      setTimeout(() => router.replace('/parent'), 600);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('profile.addChild') }} />

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle">{t('profile.addChild')}</ThemedText>
        <ThemedText type="small" style={styles.muted}>
          {t('profile.childCode')}
        </ThemedText>
        <TextField
          placeholder="123456"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          style={styles.codeInput}
        />
        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
        {linkedName ? (
          <ThemedText type="smallBold" style={styles.success}>
            {t('profile.childLinked')}: {linkedName}
          </ThemedText>
        ) : null}
        <Button title={t('profile.linkChild')} onPress={onLink} loading={loading} disabled={!code.trim()} />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  muted: { opacity: 0.7 },
  codeInput: { textAlign: 'center', fontSize: 28, fontWeight: '800', letterSpacing: 4 },
  error: { color: '#dc2626' },
  success: { color: BRAND },
});
