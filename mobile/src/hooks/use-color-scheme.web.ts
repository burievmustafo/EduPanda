import { useEffect, useState } from 'react'
import { useColorScheme as useSystemColorScheme } from 'react-native'

import { useThemeStore, type ThemePreference } from '@/store/theme-store'

/**
 * Web: static render uchun hydration; theme store bilan bir xil mantiq.
 */
export function useColorScheme(): 'light' | 'dark' {
	const [ready, setReady] = useState(false)
	const preference = useThemeStore((s) => s.preference)
	const system = useSystemColorScheme()

	useEffect(() => {
		setReady(true)
	}, [])

	if (!ready) return 'light'

	if (preference === 'dark') return 'dark'
	if (preference === 'light') return 'light'
	return system === 'dark' ? 'dark' : 'light'
}

export function useThemePreference(): ThemePreference {
	return useThemeStore((s) => s.preference)
}
