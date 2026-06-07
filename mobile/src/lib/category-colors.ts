import { colors } from '@/design/tokens'

const CAT_COLORS: Record<string, string> = {
	Programming: colors.primary,
	Language: colors.success,
	General: colors.accentPurple,
	Math: colors.warning,
	Science: '#1D4ED8',
	'Graphic Design': '#db2777',
	'User Interface': '#7c3aed',
	'User Experience': '#ea580c',
}

export function categoryColor(category: string) {
	return CAT_COLORS[category] ?? colors.primary
}
