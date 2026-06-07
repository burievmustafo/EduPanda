import { useColorScheme } from '@/hooks/use-color-scheme'

export const figmaLight = {
	background: '#FFFFFF',
	surface: '#FFFFFF',
	heading: '#1E3A8A',
	accent: '#2563EB',
	textMuted: '#6C6C6C',
	buttonBg: '#2563EB',
	buttonText: '#EFF6FF',
	tabActiveBg: '#2563EB',
	tabActiveText: '#EFF6FF',
	tabInactiveBorder: '#2563EB',
	tabInactiveText: '#1E3A8A',
	cardBorder: '#E2E8F0',
	cardShadow: 'rgba(37, 99, 235, 0.22)',
	thumbOverlay: 'rgba(37, 99, 235, 0.32)',
	progressTrack: '#D9D9D9',
	progressFill: '#2563EB',
	notificationCardBg: '#DBEAFE',
	exploreLink: '#1E3A8A',
	tabBarBg: '#2563EB',
	tabBarIcon: '#FFFFFF',
	tabBarInactiveIcon: 'rgba(239, 246, 255, 0.78)',
	tabBarActiveTile: '#F4FFFF',
	danger: '#C2410C',
	dangerSoft: '#FFF1E8',
} as const

export const figmaDark = {
	...figmaLight,
	background: '#08111F',
	surface: '#0F1E33',
	heading: '#F8FAFC',
	accent: '#2563EB',
	textMuted: '#CBD5E1',
	buttonBg: '#2563EB',
	buttonText: '#FFFFFF',
	tabActiveBg: '#2563EB',
	tabActiveText: '#E8FBFD',
	tabInactiveBorder: '#2563EB',
	tabInactiveText: '#F8FAFC',
	cardBorder: '#1D3557',
	cardShadow: 'rgba(0, 0, 0, 0.45)',
	thumbOverlay: 'rgba(96, 165, 250, 0.24)',
	progressTrack: '#1E3A5F',
	progressFill: '#2563EB',
	notificationCardBg: '#132A46',
	exploreLink: '#93C5FD',
	tabBarBg: '#1D4ED8',
	tabBarIcon: '#FFFFFF',
	tabBarInactiveIcon: 'rgba(232, 251, 253, 0.58)',
	tabBarActiveTile: '#EFF6FF',
	danger: '#FFB088',
	dangerSoft: '#3A1F17',
} as const

export type FigmaTheme = Record<keyof typeof figmaLight, string>

export function useFigmaTheme(): FigmaTheme {
	const scheme = useColorScheme()
	return scheme === 'dark' ? figmaDark : figmaLight
}
