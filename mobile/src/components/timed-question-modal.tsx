import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, BRAND } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/use-locale';
import { tText } from '@/lib/localized';
import { answerTimedQuestion } from '@/api/learning';
import type { TimedAnswerResultDTO, TimedQuestionDTO } from '@/types/dto';

type Props = {
  question: TimedQuestionDTO | null;
  /** Savol hal qilingach (javob/skip + Continue) chaqiriladi → video davom etadi. */
  onResolved: () => void;
};

export function TimedQuestionModal({ question, onResolved }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();

  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TimedAnswerResultDTO | null>(null);

  if (!question) return null;

  const reset = () => {
    setSelected(null);
    setResult(null);
    setSubmitting(false);
  };

  const handleSubmit = async (skipped: boolean) => {
    setSubmitting(true);
    try {
      const res = await answerTimedQuestion(question.id, {
        selectedOptionId: skipped ? undefined : selected ?? undefined,
        skipped,
        videoTimeSec: question.triggerTimeSec,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    reset();
    onResolved();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleContinue}>
      <View style={styles.backdrop}>
        <ThemedView style={styles.sheet}>
          <ThemedText type="small" style={styles.tag}>
            {t('question.title')}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.question}>
            {tText(question.question, locale)}
          </ThemedText>

          {/* Variantlar */}
          <View style={styles.options}>
            {question.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = result?.correctOptionId === opt.id;
              const isWrongPick = result && isSelected && !result.isCorrect;

              let borderColor: string = theme.backgroundSelected;
              if (result) {
                if (isCorrect) borderColor = '#16a34a';
                else if (isWrongPick) borderColor = '#dc2626';
              } else if (isSelected) {
                borderColor = BRAND;
              }

              return (
                <Pressable
                  key={opt.id}
                  disabled={Boolean(result)}
                  onPress={() => setSelected(opt.id)}
                  style={[styles.option, { borderColor, backgroundColor: theme.backgroundElement }]}>
                  <ThemedText>{tText(opt.text, locale)}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Natija (javobdan keyin) */}
          {result ? (
            <View style={styles.resultBox}>
              <ThemedText
                type="smallBold"
                style={{ color: result.isCorrect ? '#16a34a' : '#dc2626' }}>
                {result.isCorrect ? t('question.correct') : t('question.incorrect')}
              </ThemedText>
              {result.explanation ? (
                <ThemedText type="small" style={styles.muted}>
                  {tText(result.explanation, locale)}
                </ThemedText>
              ) : null}
              <Button title={t('question.continueVideo')} onPress={handleContinue} style={styles.cta} />
            </View>
          ) : (
            <View style={styles.actions}>
              <Button
                title={t('common.skip')}
                variant="secondary"
                onPress={() => handleSubmit(true)}
                style={styles.flex}
                disabled={submitting}
              />
              <Button
                title={t('common.submit')}
                onPress={() => handleSubmit(false)}
                style={styles.flex}
                loading={submitting}
                disabled={!selected}
              />
            </View>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  tag: { textTransform: 'uppercase', color: BRAND, letterSpacing: 1 },
  question: { fontSize: 24, lineHeight: 32 },
  options: { gap: Spacing.two },
  option: { borderWidth: 2, borderRadius: 12, padding: Spacing.three },
  actions: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  resultBox: { gap: Spacing.two },
  muted: { opacity: 0.8 },
  cta: { marginTop: Spacing.two },
});
