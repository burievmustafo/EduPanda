import { apiGet } from '@/api/client';
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
