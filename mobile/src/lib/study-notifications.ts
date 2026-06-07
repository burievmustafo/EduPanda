import type * as NotificationsType from 'expo-notifications'

let handlerConfigured = false

async function getNotifications(): Promise<typeof NotificationsType> {
	return import('expo-notifications')
}

async function ensureHandler() {
	if (handlerConfigured) return
	const Notifications = await getNotifications()
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	})
	handlerConfigured = true
}

export async function ensureNotificationPermissions(): Promise<boolean> {
	await ensureHandler()
	const Notifications = await getNotifications()
	const current = await Notifications.getPermissionsAsync()
	if (current.granted) return true
	const requested = await Notifications.requestPermissionsAsync()
	return requested.granted
}

/** weekday: 0 = Sunday … 6 = Saturday */
export async function scheduleWeeklyReminder(
	weekday: number,
	time: string,
): Promise<string | null> {
	await ensureHandler()
	const Notifications = await getNotifications()
	const [hour, minute] = time.split(':').map((v) => parseInt(v, 10))
	if (Number.isNaN(hour) || Number.isNaN(minute)) return null

	try {
		return await Notifications.scheduleNotificationAsync({
			content: {
				title: 'EduPanda',
				body: 'Time for your study session.',
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
				weekday: weekday + 1,
				hour,
				minute,
			},
		})
	} catch {
		return null
	}
}

export async function cancelReminder(notificationId: string) {
	try {
		const Notifications = await getNotifications()
		await Notifications.cancelScheduledNotificationAsync(notificationId)
	} catch {
		// ignore
	}
}
