import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

const STORAGE_KEY = '@edupanda/theme_preference'

export type ThemePreference = 'light' | 'dark' | 'system'

type ThemeState = {
	preference: ThemePreference
	hydrated: boolean
	hydrate: () => Promise<void>
	setPreference: (preference: ThemePreference) => Promise<void>
}

function isThemePreference(value: string): value is ThemePreference {
	return value === 'light' || value === 'dark' || value === 'system'
}

export const useThemeStore = create<ThemeState>((set) => ({
	preference: 'system',
	hydrated: false,

	hydrate: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY)
			if (raw && isThemePreference(raw)) {
				set({ preference: raw, hydrated: true })
				return
			}
		} catch {
			// defaults
		}
		set({ hydrated: true })
	},

	setPreference: async (preference) => {
		set({ preference })
		try {
			await AsyncStorage.setItem(STORAGE_KEY, preference)
		} catch {
			// ignore
		}
	},
}))
