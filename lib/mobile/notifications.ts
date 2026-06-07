import Notification from '@/database/notification.model'
import { connectToDatabase } from '@/lib/mongoose'

export type NotificationDTO = {
	id: string
	message: string
	isRead: boolean
	createdAt: string
}

function toDTO(doc: { _id: unknown; message?: string; isRead?: boolean; createdAt?: Date }) {
	return {
		id: String(doc._id),
		message: doc.message ?? '',
		isRead: Boolean(doc.isRead),
		createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
	}
}

/** Web `getCount` — o'qilmaganlar soni. */
export async function countUnreadNotifications(clerkId: string) {
	await connectToDatabase()
	return Notification.countDocuments({ user: clerkId, isRead: false })
}

/** Web `getNotifications` — ro'yxat + barchasini o'qilgan deb belgilash. */
export async function listNotificationsForUser(clerkId: string): Promise<NotificationDTO[]> {
	await connectToDatabase()
	const notifications = await Notification.find({ user: clerkId })
		.sort({ createdAt: -1 })
		.lean()

	await Promise.all(
		notifications.map(async (n) => {
			if (!n.isRead) {
				await Notification.updateOne({ _id: n._id }, { isRead: true })
			}
		}),
	)

	return notifications.map((n) =>
		toDTO({ ...n, isRead: true }),
	)
}

export async function clearAllNotifications(clerkId: string) {
	await connectToDatabase()
	await Notification.deleteMany({ user: clerkId })
}

export async function deleteNotificationById(clerkId: string, id: string) {
	await connectToDatabase()
	const result = await Notification.findOneAndDelete({ _id: id, user: clerkId })
	if (!result) {
		return false
	}
	return true
}
