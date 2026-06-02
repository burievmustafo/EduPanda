import { useSignUp } from '@clerk/clerk-expo';
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

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPending(true);
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/');
      } else {
        setError('Invalid code');
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? 'Verification failed');
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

      {pending ? (
        <>
          <ThemedText type="subtitle" style={styles.heading}>
            {t('auth.verifyTitle')}
          </ThemedText>
          <ThemedText type="small" style={styles.muted}>
            {t('auth.verifyHint')}
          </ThemedText>
          <TextField
            placeholder={t('auth.code')}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}
          <Button title={t('auth.verify')} onPress={onVerify} loading={loading} />
        </>
      ) : (
        <>
          <ThemedText type="subtitle" style={styles.heading}>
            {t('auth.signUp')}
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
          <Button title={t('auth.signUp')} onPress={onSignUp} loading={loading} />

          <View style={styles.row}>
            <ThemedText type="small" style={styles.muted}>
              {t('auth.haveAccount')}{' '}
            </ThemedText>
            <Link href="/(auth)/sign-in">
              <ThemedText type="small" style={styles.link}>
                {t('auth.signIn')}
              </ThemedText>
            </Link>
          </View>
        </>
      )}
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
