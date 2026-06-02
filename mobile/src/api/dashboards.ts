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

/* ------------------------------- Teacher ----------------------------------- */

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

/* -------------------------------- Parent ----------------------------------- */

export type ChildSummary = {
	studentId: string
	fullName: string
	picture?: string
	avgScore: number
	attempts: number
	completedLessons: number
}
export type ParentDashboard = { children: ChildSummary[] }
export const getParentDashboard = () =>
	apiGet<ParentDashboard>('/parent/dashboard')

export type ChildProgress = {
	byCourse: CourseProgressItem[]
	recentAttempts: AttemptItem[]
}
export const getChildProgress = (studentId: string) =>
	apiGet<ChildProgress>(`/parent/children/${studentId}/progress`)
