import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { createOrUpdateQuiz, createQuizQuestion } from '@/api/teacher';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LETTERS = ['a', 'b', 'c', 'd'];

export default function QuizBuilderScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();

  const [quizId, setQuizId] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);

  // Question form
  const [qEn, setQEn] = useState('');
  const [qJa, setQJa] = useState('');
  const [opts, setOpts] = useState([
    { en: '', ja: '' },
    { en: '', ja: '' },
    { en: '', ja: '' },
    { en: '', ja: '' },
  ]);
  const [correctIdx, setCorrectIdx] = useState(0);

  const setOpt = (i: number, key: 'en' | 'ja', val: string) =>
    setOpts((prev) => prev.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)));

  const onCreateQuiz = async () => {
    if (!titleEn.trim()) {
      setError(t('teacherCreate.required'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await createOrUpdateQuiz(sectionId, {
        title: { en: titleEn.trim(), ja: titleJa.trim() || undefined },
        passScore: 70,
      });
      setQuizId(res.id);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const onAddQuestion = async () => {
    if (!quizId) return;
    const filled = opts.filter((o) => o.en.trim());
    if (!qEn.trim() || filled.length < 2 || !opts[correctIdx]?.en.trim()) {
      setError(t('teacherCreate.required'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const options = opts
        .map((o, i) => ({ id: LETTERS[i], en: o.en.trim(), ja: o.ja.trim() }))
        .filter((o) => o.en)
        .map((o) => ({ id: o.id, text: { en: o.en, ja: o.ja || undefined } }));
      await createQuizQuestion(quizId, {
        question: { en: qEn.trim(), ja: qJa.trim() || undefined },
        options,
        correctOptionId: LETTERS[correctIdx],
      });
      setCount((c) => c + 1);
      setQEn('');
      setQJa('');
      setOpts([
        { en: '', ja: '' },
        { en: '', ja: '' },
        { en: '', ja: '' },
        { en: '', ja: '' },
      ]);
      setCorrectIdx(0);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('teacherCreate.buildQuiz') }} />

      {!quizId ? (
        <>
          <ThemedText type="smallBold">{t('teacherCreate.quizTitle')}</ThemedText>
          <TextField placeholder={`${t('teacherCreate.en')} *`} value={titleEn} onChangeText={setTitleEn} />
          <TextField placeholder={t('teacherCreate.ja')} value={titleJa} onChangeText={setTitleJa} />
          {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}
          <Button title={t('teacherCreate.buildQuiz')} onPress={onCreateQuiz} loading={busy} />
        </>
      ) : (
        <>
          <ThemedText type="smallBold">
            ✅ {count} {t('teacherCreate.questionsAdded')}
          </ThemedText>

          <ThemedText type="smallBold" style={styles.label}>
            {t('teacherCreate.questionText')}
          </ThemedText>
          <TextField placeholder={`${t('teacherCreate.en')} *`} value={qEn} onChangeText={setQEn} />
          <TextField placeholder={t('teacherCreate.ja')} value={qJa} onChangeText={setQJa} />

          {opts.map((o, i) => (
            <ThemedView key={i} type="backgroundElement" style={styles.optRow}>
              <Pressable onPress={() => setCorrectIdx(i)} style={styles.radioWrap}>
                <View
                  style={[
                    styles.radio,
                    { borderColor: correctIdx === i ? '#16a34a' : theme.backgroundSelected },
                    correctIdx === i && { backgroundColor: '#16a34a' },
                  ]}
                />
                <ThemedText type="small">{t('teacherCreate.correct')}</ThemedText>
              </Pressable>
              <View style={styles.optFields}>
                <TextField
                  placeholder={`${t('teacherCreate.option')} ${LETTERS[i].toUpperCase()} (${t('teacherCreate.en')})`}
                  value={o.en}
                  onChangeText={(v) => setOpt(i, 'en', v)}
                  style={styles.optInput}
                />
                <TextField
                  placeholder={t('teacherCreate.ja')}
                  value={o.ja}
                  onChangeText={(v) => setOpt(i, 'ja', v)}
                  style={styles.optInput}
                />
              </View>
            </ThemedView>
          ))}

          {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}
          <Button title={t('teacherCreate.addQuestion')} onPress={onAddQuestion} loading={busy} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: Spacing.two },
  error: { color: '#dc2626' },
  optRow: { flexDirection: 'row', gap: Spacing.two, borderRadius: 12, padding: Spacing.two, alignItems: 'center' },
  radioWrap: { alignItems: 'center', gap: 2, width: 56 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  optFields: { flex: 1, gap: Spacing.one },
  optInput: { minHeight: 44, paddingVertical: Spacing.two },
});
