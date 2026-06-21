import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

const STORAGE_KEY = '@edupanda/saved_course_ids'

type SavedCoursesState = {
	ids: string[]
	hydrated: boolean
	hydrate: () => Promise<void>
	toggle: (courseId: string) => Promise<void>
	isSaved: (courseId: string) => boolean
}

export const useSavedCourses = create<SavedCoursesState>((set, get) => ({
	ids: [],
	hydrated: false,

	hydrate: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY)
			const ids = raw ? (JSON.parse(raw) as string[]) : []
			set({ ids: Array.isArray(ids) ? ids : [], hydrated: true })
		} catch {
			set({ ids: [], hydrated: true })
		}
	},

	toggle: async (courseId: string) => {
		const next = get().ids.includes(courseId)
			? get().ids.filter((id) => id !== courseId)
			: [...get().ids, courseId]
		set({ ids: next })
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
	},

	isSaved: (courseId: string) => get().ids.includes(courseId),
}))
