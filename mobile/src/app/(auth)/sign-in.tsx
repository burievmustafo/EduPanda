import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/');
      } else {
        setError('Additional verification required');
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edgesTop>
      <View style={styles.header}>
        <ThemedText type="title">EduPanda</ThemedText>
        <LanguageToggle />
      </View>

      <ThemedText type="subtitle" style={styles.heading}>
        {t('auth.signIn')}
      </ThemedText>

      <TextField
        placeholder={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        placeholder={t('auth.password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <Button title={t('auth.signIn')} onPress={onSignIn} loading={loading} />

      <View style={styles.row}>
        <ThemedText type="small" style={styles.muted}>
          {t('auth.noAccount')}{' '}
        </ThemedText>
        <Link href="/(auth)/sign-up">
          <ThemedText type="small" style={styles.link}>
            {t('auth.signUp')}
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { marginTop: Spacing.four },
  error: { color: '#dc2626' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.two },
  muted: { opacity: 0.7 },
  link: { color: '#208AEF', fontWeight: '700' },
});
