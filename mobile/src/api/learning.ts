/**
 * Learning API facade — REAL backend (M3).
 *
 * Endi mock o'rniga haqiqiy `/api/mobile/*` endpointlariga ulanadi.
 * Funksiya imzolari mock bilan bir xil — shuning uchun ekranlar o'zgarmadi.
 * (Eski mock `@/mock/db` da qoladi — havola/offline uchun.)
 */

import { apiGet, apiPost } from '@/api/client'
import type {
	CourseDTO,
	LessonDetailDTO,
	LessonProgressInput,
	LessonProgressResultDTO,
	QuizAnswerInput,
	QuizAttemptResultDTO,
	QuizDTO,
	SectionDTO,
	TimedAnswerResultDTO,
} from '@/types/dto'

/* --------------------------------- Courses --------------------------------- */

export const getCourses = () => apiGet<CourseDTO[]>('/courses')

export const getCourse = (courseId: string) =>
	apiGet<CourseDTO>(`/courses/${courseId}`)

export const getSections = (courseId: string) =>
	apiGet<SectionDTO[]>(`/courses/${courseId}/sections`)

export const enrollCourse = (courseId: string) =>
	apiPost<{ isEnrolled: true }>(`/courses/${courseId}/enroll`)

/* --------------------------------- Lessons --------------------------------- */

export const getLesson = (lessonId: string) =>
	apiGet<LessonDetailDTO>(`/lessons/${lessonId}`)

export const saveLessonProgress = (
	lessonId: string,
	input: LessonProgressInput
) => apiPost<LessonProgressResultDTO>(`/lessons/${lessonId}/progress`, input)

/* ----------------------------- Timed questions ----------------------------- */

export const answerTimedQuestion = (
	questionId: string,
	payload: { selectedOptionId?: string; skipped: boolean; videoTimeSec: number }
) => apiPost<TimedAnswerResultDTO>(`/timed-questions/${questionId}/answer`, payload)

/* ---------------------------------- Quiz ----------------------------------- */

export const getSectionQuiz = (sectionId: string) =>
	apiGet<QuizDTO>(`/sections/${sectionId}/quiz`)

export const submitQuiz = (quizId: string, answers: QuizAnswerInput[]) =>
	apiPost<QuizAttemptResultDTO>(`/quizzes/${quizId}/submit`, { answers })
