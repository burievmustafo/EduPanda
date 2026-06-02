import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { createCourse } from '@/api/teacher';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function CreateCourseScreen() {
  const { t } = useTranslation();
  const [titleEn, setTitleEn] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descJa, setDescJa] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    if (!titleEn.trim()) {
      setError(t('teacherCreate.required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createCourse({
        titleI18n: { en: titleEn.trim(), ja: titleJa.trim() || undefined },
        descriptionI18n: { en: descEn.trim(), ja: descJa.trim() || undefined },
        level,
        category,
      });
      router.replace({
        pathname: '/teacher/course/[courseId]',
        params: { courseId: res.id },
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('teacherCreate.createCourse') }} />

      <ThemedText type="smallBold">{t('teacherCreate.courseTitle')}</ThemedText>
      <TextField placeholder={`${t('teacherCreate.en')} *`} value={titleEn} onChangeText={setTitleEn} />
      <TextField placeholder={t('teacherCreate.ja')} value={titleJa} onChangeText={setTitleJa} />

      <ThemedText type="smallBold" style={styles.label}>
        {t('teacherCreate.description')}
      </ThemedText>
      <TextField placeholder={t('teacherCreate.en')} value={descEn} onChangeText={setDescEn} multiline />
      <TextField placeholder={t('teacherCreate.ja')} value={descJa} onChangeText={setDescJa} multiline />

      <View style={styles.row}>
        <TextField placeholder={t('teacherCreate.level')} value={level} onChangeText={setLevel} style={styles.flex} />
        <TextField placeholder={t('teacherCreate.category')} value={category} onChangeText={setCategory} style={styles.flex} />
      </View>

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <Button title={t('teacherCreate.create')} onPress={onCreate} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  error: { color: '#dc2626' },
});
