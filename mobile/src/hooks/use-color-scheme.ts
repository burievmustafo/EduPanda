import { useColorScheme as useSystemColorScheme } from 'react-native'

import { useThemeStore, type ThemePreference } from '@/store/theme-store'

/** Resolved light/dark scheme for UI (respects user preference + system). */
export function useColorScheme(): 'light' | 'dark' {
	const preference = useThemeStore((s) => s.preference)
	const system = useSystemColorScheme()

	if (preference === 'dark') return 'dark'
	if (preference === 'light') return 'light'
	return system === 'dark' ? 'dark' : 'light'
}

export function useThemePreference(): ThemePreference {
	return useThemeStore((s) => s.preference)
}
