import { useQuery } from '@tanstack/react-query';

import {
  getChildProgress,
  getParentDashboard,
  getStudentDashboard,
  getTeacherDashboard,
} from '@/api/dashboards';
import {
  getCourse,
  getCourses,
  getLesson,
  getSectionQuiz,
  getSections,
} from '@/api/learning';
import { getMe } from '@/api/me';

/* --------------------------------- Reads ----------------------------------- */

export const useCourses = () =>
  useQuery({ queryKey: ['courses'], queryFn: getCourses });

export const useCourse = (courseId: string) =>
  useQuery({ queryKey: ['course', courseId], queryFn: () => getCourse(courseId) });

export const useSections = (courseId: string) =>
  useQuery({ queryKey: ['sections', courseId], queryFn: () => getSections(courseId) });

export const useLesson = (lessonId: string) =>
  useQuery({ queryKey: ['lesson', lessonId], queryFn: () => getLesson(lessonId) });

export const useSectionQuiz = (sectionId: string) =>
  useQuery({ queryKey: ['quiz', sectionId], queryFn: () => getSectionQuiz(sectionId) });

export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: getMe, staleTime: 60_000 });

/* ------------------------------- Dashboards -------------------------------- */

export const useStudentDashboard = () =>
  useQuery({ queryKey: ['studentDashboard'], queryFn: getStudentDashboard });

export const useTeacherDashboard = () =>
  useQuery({ queryKey: ['teacherDashboard'], queryFn: getTeacherDashboard });

export const useParentDashboard = () =>
  useQuery({ queryKey: ['parentDashboard'], queryFn: getParentDashboard });

export const useChildProgress = (studentId: string) =>
  useQuery({ queryKey: ['childProgress', studentId], queryFn: () => getChildProgress(studentId) });
