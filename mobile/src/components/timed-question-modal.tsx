import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { colors, radius, spacing } from '@/design/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPalette } from '@/design/theme';
import { Spacing } from '@/constants/theme';
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
  const scheme = useColorScheme();
  const palette = getPalette(scheme === 'dark' ? 'dark' : 'light');
  const locale = useLocale();

  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TimedAnswerResultDTO | null>(null);

  useEffect(() => {
    setSelected(null);
    setResult(null);
    setSubmitting(false);
  }, [question?.id]);

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
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <AppText variant="captionStrong" color="brand" style={styles.tag}>
            {t('question.title')}
          </AppText>
          <AppText variant="h3">{tText(question.question, locale)}</AppText>

          <View style={styles.options}>
            {question.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = result?.correctOptionId === opt.id;
              const isWrongPick = result && isSelected && !result.isCorrect;

              let borderColor: string = palette.border;
              if (result) {
                if (isCorrect) borderColor = colors.success;
                else if (isWrongPick) borderColor = colors.danger;
              } else if (isSelected) {
                borderColor = colors.primary;
              }

              return (
                <Pressable
                  key={opt.id}
                  disabled={Boolean(result)}
                  onPress={() => setSelected(opt.id)}
                  style={[
                    styles.option,
                    { borderColor, backgroundColor: palette.surfaceMuted },
                  ]}>
                  <AppText variant="body">{tText(opt.text, locale)}</AppText>
                </Pressable>
              );
            })}
          </View>

          {result ? (
            <View style={styles.resultBox}>
              <AppText variant="bodyStrong" color={result.isCorrect ? 'success' : 'danger'}>
                {result.isCorrect ? t('question.correct') : t('question.incorrect')}
              </AppText>
              {result.explanation ? (
                <AppText variant="caption" color="secondary">
                  {tText(result.explanation, locale)}
                </AppText>
              ) : null}
              <AppButton title={t('question.continueVideo')} onPress={handleContinue} />
            </View>
          ) : (
            <View style={styles.actions}>
              {!question.required ? (
                <AppButton
                  title={t('common.skip')}
                  variant="outline"
                  onPress={() => handleSubmit(true)}
                  fullWidth={false}
                  style={styles.flex}
                  disabled={submitting}
                />
              ) : null}
              <AppButton
                title={t('common.submit')}
                onPress={() => handleSubmit(false)}
                fullWidth={false}
                style={styles.flex}
                loading={submitting}
                disabled={!selected}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayDark },
  sheet: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  tag: { textTransform: 'uppercase', letterSpacing: 1 },
  options: { gap: spacing.md },
  option: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  resultBox: { gap: spacing.md },
});
