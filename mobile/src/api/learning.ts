/**
 * Learning API facade.
 *
 * HOZIR: mock data bilan ishlaydi (DTO qaytaradi, `correctOptionId`ni yashiradi).
 * KEYIN (M3): bu fayl ichidagi mock chaqiruvlar real `fetch('/api/mobile/...')`
 * ga almashtiriladi. Screen'lar faqat shu facade'ni import qiladi —
 * shuning uchun mock->API o'tishda UI tegmaydi.
 */

import {
  enrolledCourseIds,
  findCourse,
  findLesson,
  findQuiz,
  findSection,
  lessonsOfSection,
  quizzes,
  sectionsOfCourse,
  type InternalLesson,
  type InternalSection,
} from '@/mock/db';
import { mergeRanges, watchedPercent } from '@/lib/ranges';
import type {
  CourseDTO,
  LessonDetailDTO,
  LessonListItemDTO,
  LessonProgressInput,
  LessonProgressResultDTO,
  QuizAnswerInput,
  QuizAttemptResultDTO,
  QuizDTO,
  SectionDTO,
  TimedAnswerResultDTO,
  WatchedRange,
} from '@/types/dto';

/* ----------------------- Mock "server" holati (state) ---------------------- */

type ProgressRecord = {
  watchedRanges: WatchedRange[];
  watchedPercent: number;
  isCompleted: boolean;
  lastPositionSec: number;
};

const progressByLesson = new Map<string, ProgressRecord>();
const answeredTimedQuestions = new Set<string>(); // lesson re-show oldini olish (server tomon)

/** Tarmoqni simulyatsiya qiladigan kichik kechikish. */
const delay = (ms = 250) => new Promise<void>((res) => setTimeout(res, ms));

/* ------------------------------- DTO mapperlar ----------------------------- */

function lessonCountOfCourse(courseId: string): number {
  return sectionsOfCourse(courseId).reduce(
    (sum, s) => sum + lessonsOfSection(s.id).length,
    0
  );
}

function courseToDTO(courseId: string): CourseDTO | undefined {
  const c = findCourse(courseId);
  if (!c) return undefined;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    previewImage: c.previewImage,
    level: c.level,
    category: c.category,
    instructor: c.instructor,
    sectionsCount: sectionsOfCourse(c.id).length,
    lessonsCount: lessonCountOfCourse(c.id),
    isEnrolled: enrolledCourseIds.has(c.id),
  };
}

function lessonListItem(lesson: InternalLesson): LessonListItemDTO {
  const p = progressByLesson.get(lesson.id);
  return {
    id: lesson.id,
    title: lesson.title,
    position: lesson.position,
    durationSec: lesson.durationSec,
    free: lesson.free,
    progress: p ? { watchedPercent: p.watchedPercent, isCompleted: p.isCompleted } : undefined,
  };
}

function sectionToDTO(section: InternalSection): SectionDTO {
  return {
    id: section.id,
    title: section.title,
    position: section.position,
    lessons: lessonsOfSection(section.id).map(lessonListItem),
    hasQuiz: Boolean(section.quizId),
  };
}

/* --------------------------------- Courses --------------------------------- */

export async function getCourses(): Promise<CourseDTO[]> {
  await delay();
  return ['course_1'].map((id) => courseToDTO(id)).filter(Boolean) as CourseDTO[];
}

export async function getCourse(courseId: string): Promise<CourseDTO> {
  await delay();
  const dto = courseToDTO(courseId);
  if (!dto) throw new Error('Course not found');
  return dto;
}

export async function getSections(courseId: string): Promise<SectionDTO[]> {
  await delay();
  return sectionsOfCourse(courseId).map(sectionToDTO);
}

export async function enrollCourse(courseId: string): Promise<{ isEnrolled: true }> {
  await delay();
  enrolledCourseIds.add(courseId);
  return { isEnrolled: true };
}

/* --------------------------------- Lessons --------------------------------- */

export async function getLesson(lessonId: string): Promise<LessonDetailDTO> {
  await delay();
  const lesson = findLesson(lessonId);
  if (!lesson) throw new Error('Lesson not found');
  const p = progressByLesson.get(lesson.id);

  return {
    id: lesson.id,
    sectionId: lesson.sectionId,
    courseId: lesson.courseId,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    durationSec: lesson.durationSec,
    free: lesson.free,
    // ⚠️ correctOptionId / explanation BU YERDA YO'Q — faqat javobdan keyin ochiladi.
    timedQuestions: lesson.timedQuestions.map((q) => ({
      id: q.id,
      triggerTimeSec: q.triggerTimeSec,
      type: q.type,
      question: q.question,
      options: q.options,
      required: q.required,
    })),
    progress: p
      ? { lastPositionSec: p.lastPositionSec, watchedPercent: p.watchedPercent, isCompleted: p.isCompleted }
      : undefined,
  };
}

export async function saveLessonProgress(
  lessonId: string,
  input: LessonProgressInput
): Promise<LessonProgressResultDTO> {
  await delay(150);
  const lesson = findLesson(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const prev = progressByLesson.get(lessonId);
  const merged = mergeRanges([...(prev?.watchedRanges ?? []), ...input.watchedRanges]);
  const percent = watchedPercent(merged, lesson.durationSec);
  const record: ProgressRecord = {
    watchedRanges: merged,
    watchedPercent: percent,
    isCompleted: percent >= 90,
    lastPositionSec: input.lastPositionSec,
  };
  progressByLesson.set(lessonId, record);
  return { watchedPercent: record.watchedPercent, isCompleted: record.isCompleted };
}

/* ----------------------------- Timed questions ----------------------------- */

export async function answerTimedQuestion(
  questionId: string,
  payload: { selectedOptionId?: string; skipped: boolean; videoTimeSec: number }
): Promise<TimedAnswerResultDTO> {
  await delay(150);
  const lesson = findLesson_byTimedQuestion(questionId);
  const question = lesson?.timedQuestions.find((q) => q.id === questionId);
  if (!question) throw new Error('Question not found');

  answeredTimedQuestions.add(questionId);
  const isCorrect = !payload.skipped && payload.selectedOptionId === question.correctOptionId;

  // Server baholaydi, endi to'g'ri javobni ochish mumkin.
  return {
    questionId,
    isCorrect,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
  };
}

function findLesson_byTimedQuestion(questionId: string): InternalLesson | undefined {
  return lessonsAll().find((l) => l.timedQuestions.some((q) => q.id === questionId));
}

function lessonsAll(): InternalLesson[] {
  return sectionsAll().flatMap((s) => lessonsOfSection(s.id));
}

function sectionsAll(): InternalSection[] {
  return ['course_1'].flatMap((cid) => sectionsOfCourse(cid));
}

/* ---------------------------------- Quiz ----------------------------------- */

export async function getSectionQuiz(sectionId: string): Promise<QuizDTO> {
  await delay();
  const section = findSection(sectionId);
  const quiz = section?.quizId ? findQuiz(section.quizId) : undefined;
  if (!quiz) throw new Error('Quiz not found');

  // ⚠️ correctOptionId YO'Q.
  return {
    id: quiz.id,
    sectionId: quiz.sectionId,
    title: quiz.title,
    passScore: quiz.passScore,
    timeLimitMin: quiz.timeLimitMin,
    questions: quiz.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((q) => ({ id: q.id, question: q.question, options: q.options, order: q.order })),
  };
}

export async function submitQuiz(
  quizId: string,
  answers: QuizAnswerInput[]
): Promise<QuizAttemptResultDTO> {
  await delay(300);
  const quiz = findQuiz(quizId);
  if (!quiz) throw new Error('Quiz not found');

  // Baholash FAQAT serverda.
  const review = quiz.questions.map((q) => {
    const given = answers.find((a) => a.questionId === q.id);
    const selectedOptionId = given?.selectedOptionId ?? '';
    return {
      questionId: q.id,
      selectedOptionId,
      correctOptionId: q.correctOptionId,
      isCorrect: selectedOptionId === q.correctOptionId,
      explanation: q.explanation,
    };
  });

  const correctAnswers = review.filter((r) => r.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return {
    attemptId: `attempt_${Date.now()}`,
    totalQuestions,
    correctAnswers,
    score,
    passed: score >= quiz.passScore,
    review,
  };
}

// Lint: import ishlatilishini ta'minlash uchun (quizzes to'g'ridan-to'g'ri kerak bo'lmasligi mumkin)
void quizzes;
