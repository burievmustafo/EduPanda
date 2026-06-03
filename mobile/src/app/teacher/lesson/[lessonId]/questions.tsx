import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getLesson } from '@/api/learning';
import { createTimedQuestion } from '@/api/teacher';
import { LessonVideo, VideoFrame } from '@/components/lesson-video';
import { LoadingState, Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { formatTime, tText } from '@/lib/localized';
import type { LessonDetailDTO } from '@/types/dto';

const LETTERS = ['a', 'b', 'c', 'd'];

export default function TimedQuestionBuilderScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(0);
  const { data: lesson, loading } = useAsync(() => getLesson(lessonId), [lessonId, refresh]);

  if (loading || !lesson) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('teacherCreate.timedQuestions') }} />
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }

  return <TimedQuestionBuilderContent lesson={lesson} onSaved={() => setRefresh((r) => r + 1)} />;
}

function TimedQuestionBuilderContent({
  lesson,
  onSaved,
}: {
  lesson: LessonDetailDTO;
  onSaved: () => void;
}) {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const hasVideo = Boolean(lesson.videoUrl);

  const [timeSec, setTimeSec] = useState('30');
  const [qEn, setQEn] = useState('');
  const [qJa, setQJa] = useState('');
  const [exEn, setExEn] = useState('');
  const [exJa, setExJa] = useState('');
  const [opts, setOpts] = useState([
    { en: '', ja: '' },
    { en: '', ja: '' },
    { en: '', ja: '' },
    { en: '', ja: '' },
  ]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const setOpt = (i: number, key: 'en' | 'ja', val: string) =>
    setOpts((prev) => prev.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)));

  const resetForm = () => {
    setTimeSec('30');
    setQEn('');
    setQJa('');
    setExEn('');
    setExJa('');
    setOpts([
      { en: '', ja: '' },
      { en: '', ja: '' },
      { en: '', ja: '' },
      { en: '', ja: '' },
    ]);
    setCorrectIdx(0);
  };

  const onAddQuestion = async () => {
    const triggerTimeSec = Number(timeSec);
    const filledOptions = opts.filter((o) => o.en.trim());

    if (!hasVideo) {
      setError(t('teacherCreate.noVideoForQuestion'));
      return;
    }
    if (!qEn.trim() || filledOptions.length < 2 || !opts[correctIdx]?.en.trim() || !Number.isFinite(triggerTimeSec)) {
      setError(t('teacherCreate.required'));
      return;
    }

    setBusy(true);
    setError('');
    setSaved('');
    try {
      const options = opts
        .map((o, i) => ({ id: LETTERS[i], en: o.en.trim(), ja: o.ja.trim() }))
        .filter((o) => o.en)
        .map((o) => ({ id: o.id, text: { en: o.en, ja: o.ja || undefined } }));

      await createTimedQuestion(lessonId, {
        triggerTimeSec: Math.max(1, Math.round(triggerTimeSec)),
        question: { en: qEn.trim(), ja: qJa.trim() || undefined },
        options,
        correctOptionId: LETTERS[correctIdx],
        explanation:
          exEn.trim() || exJa.trim()
            ? { en: exEn.trim(), ja: exJa.trim() || undefined }
            : undefined,
      });

      setSaved(t('teacherCreate.questionAdded'));
      resetForm();
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('teacherCreate.timedQuestions') }} />

      <ThemedText style={styles.title}>{tText(lesson.title, locale)}</ThemedText>
      <ThemedText type="small" style={styles.muted}>
        {formatTime(lesson.durationSec)}
      </ThemedText>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">{t('teacherCreate.videoPreview')}</ThemedText>
        {hasVideo ? (
          <>
            <View style={styles.videoWrap}>
              <VideoFrame>
                <LessonVideo url={lesson.videoUrl} />
              </VideoFrame>
            </View>
            <ThemedText type="small" style={styles.muted}>
              {lesson.videoUrl}
            </ThemedText>
          </>
        ) : (
          <ThemedText type="small" style={styles.error}>
            {t('teacherCreate.noVideoForQuestion')}
          </ThemedText>
        )}
        <ThemedText type="small" style={styles.muted}>
          {t('teacherCreate.optionalTimedQuestion')}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">{t('teacherCreate.existingQuestions')}</ThemedText>
        {lesson.timedQuestions.length > 0 ? (
          lesson.timedQuestions.map((q, index) => (
            <View key={q.id} style={styles.existingRow}>
              <ThemedText type="smallBold">
                {index + 1}. {formatTime(q.triggerTimeSec)}
              </ThemedText>
              <ThemedText type="small" style={styles.muted}>
                {tText(q.question, locale)}
              </ThemedText>
            </View>
          ))
        ) : (
          <ThemedText type="small" style={styles.muted}>
            {t('teacherCreate.noTimedQuestions')}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedText type="smallBold">{t('teacherCreate.addTimedQuestion')}</ThemedText>
      <TextField
        placeholder={t('teacherCreate.triggerTime')}
        keyboardType="number-pad"
        value={timeSec}
        onChangeText={setTimeSec}
      />

      <ThemedText type="smallBold" style={styles.label}>
        {t('teacherCreate.questionText')}
      </ThemedText>
      <TextField placeholder={`${t('teacherCreate.en')} *`} value={qEn} onChangeText={setQEn} multiline />
      <TextField placeholder={t('teacherCreate.ja')} value={qJa} onChangeText={setQJa} multiline />

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

      <ThemedText type="smallBold" style={styles.label}>
        {t('teacherCreate.explanation')}
      </ThemedText>
      <TextField placeholder={t('teacherCreate.en')} value={exEn} onChangeText={setExEn} multiline />
      <TextField placeholder={t('teacherCreate.ja')} value={exJa} onChangeText={setExJa} multiline />

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      {saved ? (
        <ThemedText type="small" style={styles.success}>
          {saved}
        </ThemedText>
      ) : null}

      <Button
        title={t('teacherCreate.addTimedQuestion')}
        onPress={onAddQuestion}
        loading={busy}
        disabled={!hasVideo}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  muted: { opacity: 0.7 },
  label: { marginTop: Spacing.two },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000000' },
  existingRow: { gap: 2, paddingTop: Spacing.one },
  optRow: { flexDirection: 'row', gap: Spacing.two, borderRadius: 12, padding: Spacing.two, alignItems: 'center' },
  radioWrap: { alignItems: 'center', gap: 2, width: 56 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  optFields: { flex: 1, gap: Spacing.one },
  optInput: { minHeight: 44, paddingVertical: Spacing.two },
  error: { color: '#dc2626' },
  success: { color: BRAND, fontWeight: '700' },
});
