import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import {
  getStudentDashboard,
  getTeacherDashboard,
} from '@/api/dashboards';
import {
  getCourse,
  getCourseGrades,
  getCourseResources,
  getCourses,
  getLesson,
  getSectionQuiz,
  getSections,
} from '@/api/learning';
import { getMe } from '@/api/me';
import {
  getNotificationCount,
  getNotifications,
} from '@/api/notifications';
import { getPaymentCards } from '@/api/payment';

/* --------------------------------- Reads ----------------------------------- */

/** Clerk sessiyasi yuklanguncha API so'rovlarini kechiktiradi. */
function useClerkApiReady() {
  const { isLoaded } = useAuth();
  return isLoaded;
}

export const useCourses = () => {
  const enabled = useClerkApiReady();
  return useQuery({ queryKey: ['courses'], queryFn: getCourses, enabled });
};

export const useCourse = (courseId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId),
    enabled: enabled && Boolean(courseId),
  });
};

export const useSections = (courseId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => getSections(courseId),
    enabled: enabled && Boolean(courseId),
  });
};

export const useCourseGrades = (courseId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['course-grades', courseId],
    queryFn: () => getCourseGrades(courseId),
    enabled: enabled && Boolean(courseId),
  });
};

export const useCourseResources = (courseId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['course-resources', courseId],
    queryFn: () => getCourseResources(courseId),
    enabled: enabled && Boolean(courseId),
  });
};

export const useLesson = (lessonId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId),
    enabled: enabled && Boolean(lessonId),
  });
};

export const useSectionQuiz = (sectionId: string) => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['quiz', sectionId],
    queryFn: () => getSectionQuiz(sectionId),
    enabled: enabled && Boolean(sectionId),
  });
};

export const useMe = () => {
  const enabled = useClerkApiReady();
  return useQuery({ queryKey: ['me'], queryFn: getMe, staleTime: 60_000, enabled });
};

/* ------------------------------- Dashboards -------------------------------- */

export const useStudentDashboard = () => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['studentDashboard'],
    queryFn: getStudentDashboard,
    enabled,
  });
};

export const useTeacherDashboard = () => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: getTeacherDashboard,
    enabled,
  });
};

/* ----------------------------- Notifications ------------------------------- */

export const useNotifications = () => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled,
  });
};

export const useNotificationCount = () => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['notificationCount'],
    queryFn: async () => {
      const { count } = await getNotificationCount();
      return count;
    },
    enabled,
    staleTime: 15_000,
  });
};

/* -------------------------------- Payment ---------------------------------- */

export const usePaymentCards = () => {
  const enabled = useClerkApiReady();
  return useQuery({
    queryKey: ['paymentCards'],
    queryFn: getPaymentCards,
    enabled,
  });
};
