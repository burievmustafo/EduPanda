import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';

import { createLesson } from '@/api/teacher';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function AddLessonScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { t } = useTranslation();

  const [titleEn, setTitleEn] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [duration, setDuration] = useState('596');
  const [free, setFree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    if (!titleEn.trim()) {
      setError(t('teacherCreate.required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createLesson(sectionId, {
        titleI18n: { en: titleEn.trim(), ja: titleJa.trim() || undefined },
        videoUrl: videoUrl.trim(),
        durationSec: Number(duration) || 0,
        free,
      });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('teacherCreate.addLesson') }} />

      <ThemedText type="smallBold">{t('teacherCreate.lessonTitle')}</ThemedText>
      <TextField placeholder={`${t('teacherCreate.en')} *`} value={titleEn} onChangeText={setTitleEn} />
      <TextField placeholder={t('teacherCreate.ja')} value={titleJa} onChangeText={setTitleJa} />

      <ThemedText type="smallBold" style={styles.label}>
        {t('teacherCreate.videoUrl')}
      </ThemedText>
      <TextField placeholder="https://..." autoCapitalize="none" value={videoUrl} onChangeText={setVideoUrl} />

      <View style={styles.row}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{t('teacherCreate.duration')}</ThemedText>
          <TextField placeholder="596" keyboardType="number-pad" value={duration} onChangeText={setDuration} />
        </View>
        <View style={styles.switchBox}>
          <ThemedText type="smallBold">{t('teacherCreate.freeLesson')}</ThemedText>
          <Switch value={free} onValueChange={setFree} trackColor={{ true: BRAND }} />
        </View>
      </View>

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <Button title={t('teacherCreate.save')} onPress={onSave} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-end' },
  flex: { flex: 1, gap: Spacing.two },
  switchBox: { gap: Spacing.two, alignItems: 'center' },
  error: { color: '#dc2626' },
});
