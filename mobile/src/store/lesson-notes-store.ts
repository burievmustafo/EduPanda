import AsyncStorage from '@react-native-async-storage/async-storage'

import type { LessonNote } from '@/components/lesson/notes-panel'

const KEY_PREFIX = '@edupanda/lesson_notes/'

function storageKey(lessonId: string) {
	return `${KEY_PREFIX}${lessonId}`
}

export async function loadLessonNotes(lessonId: string): Promise<LessonNote[]> {
	try {
		const raw = await AsyncStorage.getItem(storageKey(lessonId))
		if (!raw) return []
		const parsed = JSON.parse(raw) as LessonNote[]
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export async function persistLessonNotes(lessonId: string, notes: LessonNote[]): Promise<void> {
	await AsyncStorage.setItem(storageKey(lessonId), JSON.stringify(notes))
}
