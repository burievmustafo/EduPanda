import { apiGet } from '@/api/client'
import type { LocalizedText } from '@/types/dto'

export type CourseProgressItem = {
	courseId: string
	title: LocalizedText
	totalLessons: number
	completedLessons: number
	percent: number
}

export type AttemptItem = {
	attemptId: string
	quizTitle: LocalizedText
	score: number
	passed: boolean
	submittedAt: string
}

/* ------------------------------- Student ----------------------------------- */

export type StudentDashboard = {
	inProgress: CourseProgressItem[]
	recentAttempts: AttemptItem[]
}
export const getStudentDashboard = () =>
	apiGet<StudentDashboard>('/student/dashboard')

/* ------------------------------ Instructor --------------------------------- */

export type TeacherCourse = {
	courseId: string
	title: LocalizedText
	published: boolean
	studentCount: number
	attempts: number
	avgScore: number
}
export type TeacherDashboard = { courses: TeacherCourse[] }
export const getTeacherDashboard = () =>
	apiGet<TeacherDashboard>('/teacher/dashboard')
