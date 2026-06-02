import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getCourse, getSections } from '@/api/learning';
import { createSection, updateCourse } from '@/api/teacher';
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

export default function CourseBuilderScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((r) => r + 1), []));

  const { data: course, loading: lc } = useAsync(() => getCourse(courseId), [courseId, refresh]);
  const { data: sections, loading: ls } = useAsync(() => getSections(courseId), [courseId, refresh]);

  const [secEn, setSecEn] = useState('');
  const [secJa, setSecJa] = useState('');
  const [busy, setBusy] = useState(false);

  const onPublish = async () => {
    setBusy(true);
    try {
      await updateCourse(courseId, { published: true });
    } finally {
      setBusy(false);
      setRefresh((r) => r + 1);
    }
  };

  const onAddSection = async () => {
    if (!secEn.trim()) return;
    setBusy(true);
    try {
      await createSection(courseId, {
        titleI18n: { en: secEn.trim(), ja: secJa.trim() || undefined },
      });
      setSecEn('');
      setSecJa('');
    } finally {
      setBusy(false);
      setRefresh((r) => r + 1);
    }
  };

  if (lc || ls || !course) {
    return (
      <Screen>
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: tText(course.title, locale) }} />

      <ThemedText style={styles.title}>{tText(course.title, locale)}</ThemedText>
      <Button
        title={t('teacherCreate.publish')}
        variant="secondary"
        onPress={onPublish}
        loading={busy}
      />

      {sections?.map((section) => (
        <ThemedView key={section.id} type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">{tText(section.title, locale)}</ThemedText>

          {section.lessons.length > 0 ? (
            section.lessons.map((l) => (
              <ThemedText key={l.id} type="small" style={styles.lesson}>
                ▶️ {tText(l.title, locale)} · {formatTime(l.durationSec)}
              </ThemedText>
            ))
          ) : (
            <ThemedText type="small" style={styles.muted}>
              —
            </ThemedText>
          )}

          <View style={styles.sectionActions}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/teacher/section/[sectionId]/add-lesson',
                  params: { sectionId: section.id },
                })
              }>
              <ThemedText type="small" style={styles.link}>
                + {t('teacherCreate.addLesson')}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/teacher/quiz/[sectionId]', params: { sectionId: section.id } })
              }>
              <ThemedText type="small" style={styles.link}>
                📝 {t('teacherCreate.buildQuiz')}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ))}

      {/* Add section */}
      <ThemedView style={[styles.addBox, { borderColor: theme.backgroundSelected }]}>
        <ThemedText type="smallBold">{t('teacherCreate.addSection')}</ThemedText>
        <TextField placeholder={`${t('teacherCreate.en')} *`} value={secEn} onChangeText={setSecEn} />
        <TextField placeholder={t('teacherCreate.ja')} value={secJa} onChangeText={setSecJa} />
        <Button title={t('teacherCreate.addSection')} onPress={onAddSection} loading={busy} disabled={!secEn.trim()} />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700' },
  section: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one },
  lesson: { opacity: 0.9 },
  muted: { opacity: 0.6 },
  sectionActions: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  link: { color: BRAND, fontWeight: '700' },
  addBox: { borderWidth: 1, borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
});
