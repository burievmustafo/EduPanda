import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { getSectionQuiz, submitQuiz } from '@/api/learning';
import { LoadingState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, Button } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { tText } from '@/lib/localized';
import { cacheQuizAttempt, getCachedQuizAttempt } from '@/lib/quiz-attempt-cache';
import type { QuizAttemptResultDTO, QuizDTO } from '@/types/dto';

function resolveSectionId(sectionId: string | string[] | undefined) {
  if (Array.isArray(sectionId)) return sectionId[0];
  return sectionId;
}

async function hydrateQuizAttempts(quiz: QuizDTO): Promise<QuizDTO> {
  if (quiz.latestAttempt) {
    await cacheQuizAttempt(quiz.id, quiz.latestAttempt);
    return quiz;
  }

  const cached = await getCachedQuizAttempt(quiz.id);
  if (!cached) return quiz;

  const attempts = [
    cached,
    ...(quiz.attempts ?? []).filter((attempt) => attempt.attemptId !== cached.attemptId),
  ];

  return {
    ...quiz,
    latestAttempt: cached,
    attempts,
  };
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{ sectionId: string | string[] }>();
  const sectionId = resolveSectionId(params.sectionId);
  const { t } = useTranslation();
  const [quiz, setQuiz] = useState<QuizDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const loadQuiz = useCallback(
    async (options?: { background?: boolean }) => {
      if (!sectionId) return;
      if (!options?.background) setLoading(true);
      try {
        const nextQuiz = await hydrateQuizAttempts(await getSectionQuiz(sectionId));
        setQuiz(nextQuiz);
      } catch (err) {
        Alert.alert(t('quiz.title'), err instanceof Error ? err.message : t('common.retry'));
      } finally {
        if (!options?.background) setLoading(false);
      }
    },
    [sectionId, t]
  );

  useFocusEffect(
    useCallback(() => {
      void loadQuiz({ background: hasLoadedRef.current });
      hasLoadedRef.current = true;
    }, [loadQuiz])
  );

  const handleAttemptSaved = useCallback((attempt: QuizAttemptResultDTO) => {
    setQuiz((current) => {
      if (!current) return current;
      const attempts = [
        attempt,
        ...(current.attempts ?? []).filter((item) => item.attemptId !== attempt.attemptId),
      ];
      return {
        ...current,
        latestAttempt: attempt,
        attempts,
      };
    });
  }, []);

  if (loading || !quiz) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('quiz.title') }} />
        <LoadingState label={t('common.loading')} />
      </Screen>
    );
  }

  return (
    <QuizRunner
      key={`${quiz.id}:${quiz.latestAttempt?.attemptId ?? 'fresh'}`}
      quiz={quiz}
      onAttemptSaved={handleAttemptSaved}
    />
  );
}

function QuizRunner({
  quiz,
  onAttemptSaved,
}: {
  quiz: QuizDTO;
  onAttemptSaved: (attempt: QuizAttemptResultDTO) => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [result, setResult] = useState<QuizAttemptResultDTO | null>(quiz.latestAttempt ?? null);

  useEffect(() => {
    if (isRetaking) return;
    setResult(quiz.latestAttempt ?? null);
    if (quiz.latestAttempt) {
      setAnswers({});
      setIndex(0);
    }
  }, [quiz.latestAttempt?.attemptId, isRetaking]);

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
      await cacheQuizAttempt(quiz.id, res);
      setIsRetaking(false);
      setResult(res);
      onAttemptSaved(res);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <QuizResult
        quiz={quiz}
        result={result}
        onRetake={() => {
          setIsRetaking(true);
          setResult(null);
          setAnswers({});
          setIndex(0);
        }}
      />
    );
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
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: selected ? BRAND : theme.backgroundSelected,
                },
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

function QuizResult({
  quiz,
  result,
  onRetake,
}: {
  quiz: QuizDTO;
  result: QuizAttemptResultDTO;
  onRetake: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const color = result.passed ? '#16a34a' : '#dc2626';
  const history = [
    result,
    ...(quiz.attempts ?? []).filter((attempt) => attempt.attemptId !== result.attemptId),
  ];

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

      <View style={styles.resultActions}>
        <Button title={t('quiz.retake')} variant="secondary" onPress={onRetake} style={styles.flex} />
        <Button title={t('quiz.backToCourse')} onPress={() => router.back()} style={styles.flex} />
      </View>

      <ThemedText type="smallBold" style={styles.heading}>
        {t('quiz.reviewAnswers')}
      </ThemedText>

      {result.review.map((item, index) => {
        const question = quiz.questions.find((q) => q.id === item.questionId);
        return (
          <ThemedView key={item.questionId} type="backgroundElement" style={styles.reviewCard}>
            <ThemedText type="smallBold">
              {index + 1}. {question ? tText(question.question, locale) : ''}
            </ThemedText>
            <View style={styles.reviewOptions}>
              {question?.options.map((option) => {
                const isCorrect = option.id === item.correctOptionId;
                const isSelectedWrong = option.id === item.selectedOptionId && !item.isCorrect;
                return (
                  <View
                    key={option.id}
                    style={[
                      styles.reviewOption,
                      isCorrect ? styles.reviewOptionCorrect : null,
                      isSelectedWrong ? styles.reviewOptionWrong : null,
                    ]}>
                    <ThemedText style={styles.reviewOptionText}>
                      {tText(option.text, locale)}
                    </ThemedText>
                    {isCorrect ? (
                      <ThemedText type="smallBold" style={styles.correctText}>
                        {t('quiz.correctAnswer')}
                      </ThemedText>
                    ) : isSelectedWrong ? (
                      <ThemedText type="smallBold" style={styles.wrongText}>
                        {t('quiz.yourAnswer')}
                      </ThemedText>
                    ) : null}
                  </View>
                );
              })}
            </View>
            {item.explanation ? (
              <ThemedText type="small" style={styles.muted}>
                {tText(item.explanation, locale)}
              </ThemedText>
            ) : null}
          </ThemedView>
        );
      })}

      {history.length > 0 ? (
        <>
          <ThemedText type="smallBold" style={styles.heading}>
            {t('quiz.attemptHistory')}
          </ThemedText>
          <View style={styles.historyList}>
            {history.map((attempt, index) => (
              <ThemedView key={attempt.attemptId} type="backgroundElement" style={styles.historyRow}>
                <ThemedText type="smallBold">
                  #{history.length - index} - {attempt.score}%
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.muted, { color: attempt.passed ? '#16a34a' : '#dc2626' }]}>
                  {attempt.passed ? t('quiz.passed') : t('quiz.failed')} - {attempt.correctAnswers}/
                  {attempt.totalQuestions}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </>
      ) : null}

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
  resultActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  historyList: { gap: Spacing.one },
  historyRow: { borderRadius: 12, padding: Spacing.two, gap: 2 },
  flex: { flex: 1 },
  scoreCard: { borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  scoreBig: { fontSize: 56, fontWeight: '800', lineHeight: 60 },
  heading: { marginTop: Spacing.two, opacity: 0.8 },
  reviewCard: { borderRadius: 12, padding: Spacing.three, gap: 2 },
  reviewOptions: { gap: Spacing.one, marginTop: Spacing.two },
  reviewOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: Spacing.two,
    gap: 2,
  },
  reviewOptionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
  },
  reviewOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  reviewOptionText: { fontWeight: '600' },
  correctText: { color: '#16a34a' },
  wrongText: { color: '#dc2626' },
  muted: { opacity: 0.75 },
});
