import { apiGet, apiPatch, apiPost } from '@/api/client';
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

export type UpdateMeInput = {
  fullName: string;
  email: string;
};

export const updateMe = (input: UpdateMeInput) =>
  apiPatch<Me>('/me', input);

export const uploadProfileAvatar = (imageBase64: string) =>
  apiPost<Me>('/me/avatar', { imageBase64 });
