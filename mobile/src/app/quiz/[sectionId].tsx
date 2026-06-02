import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getSectionQuiz, submitQuiz } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';
import type { QuizAttemptResultDTO, QuizDTO } from '@/types/dto';

export default function QuizScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { t } = useTranslation();
  const { data: quiz, loading } = useAsync(() => getSectionQuiz(sectionId), [sectionId]);

  if (loading || !quiz) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('quiz.title') }} />
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }
  return <QuizRunner quiz={quiz} />;
}

function QuizRunner({ quiz }: { quiz: QuizDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResultDTO | null>(null);

  const total = quiz.questions.length;
  const current = quiz.questions[index];
  const isLast = index === total - 1;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] ?? '',
      }));
      const res = await submitQuiz(quiz.id, payload);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return <QuizResult quiz={quiz} result={result} />;
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: tText(quiz.title, locale) }} />

      <ThemedText type="small" style={styles.counter}>
        {t('quiz.question')} {index + 1} {t('quiz.of')} {total}
      </ThemedText>

      <ThemedText style={styles.question}>{tText(current.question, locale)}</ThemedText>

      <View style={styles.options}>
        {current.options.map((opt) => {
          const selected = answers[current.id] === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setAnswers((a) => ({ ...a, [current.id]: opt.id }))}
              style={[
                styles.option,
                { backgroundColor: theme.backgroundElement, borderColor: selected ? BRAND : theme.backgroundSelected },
              ]}>
              <ThemedText>{tText(opt.text, locale)}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.nav}>
        <Button
          title={t('common.previous')}
          variant="secondary"
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={styles.flex}
        />
        {isLast ? (
          <Button
            title={t('quiz.submitTest')}
            onPress={handleSubmit}
            loading={submitting}
            disabled={Object.keys(answers).length < total}
            style={styles.flex}
          />
        ) : (
          <Button
            title={t('common.next')}
            onPress={() => setIndex((i) => Math.min(total - 1, i + 1))}
            style={styles.flex}
          />
        )}
      </View>
    </Screen>
  );
}

function QuizResult({ quiz, result }: { quiz: QuizDTO; result: QuizAttemptResultDTO }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const color = result.passed ? '#16a34a' : '#dc2626';

  return (
    <Screen>
      <Stack.Screen options={{ title: t('quiz.result') }} />

      <ThemedView type="backgroundElement" style={styles.scoreCard}>
        <ThemedText type="small" style={styles.muted}>
          {t('quiz.score')}
        </ThemedText>
        <ThemedText style={[styles.scoreBig, { color }]}>{result.score}%</ThemedText>
        <ThemedText type="smallBold" style={{ color }}>
          {result.passed ? t('quiz.passed') : t('quiz.failed')}
        </ThemedText>
        <ThemedText type="small" style={styles.muted}>
          {t('quiz.correctAnswers')}: {result.correctAnswers} / {result.totalQuestions}
        </ThemedText>
      </ThemedView>

      <ThemedText type="smallBold" style={styles.heading}>
        {t('quiz.reviewAnswers')}
      </ThemedText>

      {result.review.map((r, i) => {
        const q = quiz.questions.find((x) => x.id === r.questionId);
        const yourOpt = q?.options.find((o) => o.id === r.selectedOptionId);
        const correctOpt = q?.options.find((o) => o.id === r.correctOptionId);
        return (
          <ThemedView key={r.questionId} type="backgroundElement" style={styles.reviewCard}>
            <ThemedText type="smallBold">
              {i + 1}. {q ? tText(q.question, locale) : ''} {r.isCorrect ? '✅' : '❌'}
            </ThemedText>
            <ThemedText type="small" style={styles.muted}>
              {t('quiz.yourAnswer')}: {yourOpt ? tText(yourOpt.text, locale) : '—'}
            </ThemedText>
            {!r.isCorrect ? (
              <ThemedText type="small" style={{ color: '#16a34a' }}>
                {t('quiz.correctAnswer')}: {correctOpt ? tText(correctOpt.text, locale) : ''}
              </ThemedText>
            ) : null}
            {r.explanation ? (
              <ThemedText type="small" style={styles.muted}>
                {tText(r.explanation, locale)}
              </ThemedText>
            ) : null}
          </ThemedView>
        );
      })}

      <Button title={t('quiz.backToCourse')} onPress={() => router.back()} />
      {/* theme refs to avoid unused warnings on some setups */}
      <View style={{ height: 0, borderColor: theme.background }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: { opacity: 0.7 },
  question: { fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: Spacing.two },
  options: { gap: Spacing.two },
  option: { borderWidth: 2, borderRadius: 12, padding: Spacing.three },
  nav: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  flex: { flex: 1 },
  scoreCard: { borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  scoreBig: { fontSize: 56, fontWeight: '800', lineHeight: 60 },
  heading: { marginTop: Spacing.two, opacity: 0.8 },
  reviewCard: { borderRadius: 12, padding: Spacing.three, gap: 2 },
  muted: { opacity: 0.75 },
});
