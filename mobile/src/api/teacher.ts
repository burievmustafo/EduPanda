import { apiPatch, apiPost } from '@/api/client';
import type { LocalizedText, Option } from '@/types/dto';

/* --------------------------------- Course ---------------------------------- */

export const createCourse = (data: {
  titleI18n: LocalizedText;
  descriptionI18n?: LocalizedText;
  level?: string;
  category?: string;
}) => apiPost<{ id: string; slug: string }>('/teacher/courses', data);

export const updateCourse = (
  courseId: string,
  data: { published?: boolean; titleI18n?: LocalizedText; descriptionI18n?: LocalizedText }
) => apiPatch<{ id: string; published: boolean }>(`/teacher/courses/${courseId}`, data);

/* -------------------------------- Section ---------------------------------- */

export const createSection = (courseId: string, data: { titleI18n: LocalizedText }) =>
  apiPost<{ id: string }>(`/teacher/courses/${courseId}/sections`, data);

/* --------------------------------- Lesson ---------------------------------- */

export const createLesson = (
  sectionId: string,
  data: {
    titleI18n: LocalizedText;
    contentI18n?: LocalizedText;
    videoUrl: string;
    durationSec: number;
    free: boolean;
  }
) => apiPost<{ id: string }>(`/teacher/sections/${sectionId}/lessons`, data);

/* ----------------------------- Timed question ------------------------------ */

export const createTimedQuestion = (
  lessonId: string,
  data: {
    triggerTimeSec: number;
    question: LocalizedText;
    options: Option[];
    correctOptionId: string;
    explanation?: LocalizedText;
  }
) => apiPost<{ id: string }>(`/teacher/lessons/${lessonId}/timed-questions`, data);

/* ---------------------------------- Quiz ----------------------------------- */

export const createOrUpdateQuiz = (
  sectionId: string,
  data: { title: LocalizedText; passScore?: number }
) => apiPost<{ id: string }>(`/teacher/sections/${sectionId}/quiz`, data);

export const createQuizQuestion = (
  quizId: string,
  data: {
    question: LocalizedText;
    options: Option[];
    correctOptionId: string;
    explanation?: LocalizedText;
  }
) => apiPost<{ id: string }>(`/teacher/quizzes/${quizId}/questions`, data);
