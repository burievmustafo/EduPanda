import { apiGet, apiPost } from '@/api/client';
import type { UserRole } from '@/types/dto';

export type Me = {
  id: string;
  clerkId: string;
  fullName: string;
  email: string;
  picture?: string;
  role: UserRole;
};

export const getMe = () => apiGet<Me>('/me');

export const createStudentInviteCode = () =>
  apiPost<{ code: string }>('/student/invite-code', {});

export const linkParentChild = (code: string) =>
  apiPost<{ studentId: string; fullName: string; picture?: string }>('/parent/link', { code });
