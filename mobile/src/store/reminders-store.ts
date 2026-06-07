import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import {
	cancelReminder,
	scheduleWeeklyReminder,
} from '@/lib/study-notifications'

const STORAGE_KEY = '@edupanda/study_reminders'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DayReminder = {
	weekday: Weekday
	enabled: boolean
	time: string | null
	notificationId: string | null
}

const defaultDays = (): DayReminder[] =>
	([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => ({
		weekday,
		enabled: false,
		time: null,
		notificationId: null,
	}))

async function persist(days: DayReminder[]) {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(days))
}

type RemindersState = {
	days: DayReminder[]
	hydrated: boolean
	hydrate: () => Promise<void>
	setDayEnabled: (weekday: Weekday, enabled: boolean, time?: string) => Promise<boolean>
	resetAll: () => Promise<void>
	enabledCount: () => number
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
	days: defaultDays(),
	hydrated: false,

	hydrate: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY)
			if (raw) {
				const parsed = JSON.parse(raw) as DayReminder[]
				if (Array.isArray(parsed) && parsed.length === 7) {
					set({ days: parsed, hydrated: true })
					return
				}
			}
		} catch {
			// use defaults
		}
		set({ days: defaultDays(), hydrated: true })
	},

	setDayEnabled: async (weekday, enabled, time) => {
		const days = [...get().days]
		const index = days.findIndex((d) => d.weekday === weekday)
		if (index < 0) return false

		const current = days[index]

		if (!enabled) {
			if (current.notificationId) {
				await cancelReminder(current.notificationId)
			}
			days[index] = {
				...current,
				enabled: false,
				notificationId: null,
			}
			set({ days })
			await persist(days)
			return true
		}

		const nextTime = time ?? current.time ?? '09:00'
		if (current.notificationId) {
			await cancelReminder(current.notificationId)
		}
		const notificationId = await scheduleWeeklyReminder(weekday, nextTime)
		days[index] = {
			...current,
			enabled: true,
			time: nextTime,
			notificationId,
		}
		set({ days })
		await persist(days)
		return Boolean(notificationId)
	},

	resetAll: async () => {
		const days = get().days
		for (const day of days) {
			if (day.notificationId) {
				await cancelReminder(day.notificationId)
			}
		}
		const reset = defaultDays()
		set({ days: reset })
		await persist(reset)
	},

	enabledCount: () => get().days.filter((d) => d.enabled).length,
}))
