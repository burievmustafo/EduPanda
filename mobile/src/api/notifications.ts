import { apiDelete, apiGet } from '@/api/client'

export type NotificationDTO = {
	id: string
	message: string
	isRead: boolean
	createdAt: string
}

export const getNotifications = () => apiGet<NotificationDTO[]>('/notifications')

export const getNotificationCount = () =>
	apiGet<{ count: number }>('/notifications/count')

export const clearNotifications = () =>
	apiDelete<{ cleared: boolean }>('/notifications')

export const deleteNotification = (id: string) =>
	apiDelete<{ deleted: boolean }>(`/notifications/${id}`)
