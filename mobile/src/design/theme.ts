import { colors, colorsDark, layout, radius, shadow, spacing, typography } from './tokens'

export type ColorScheme = 'light' | 'dark'

export function getPalette(scheme: ColorScheme) {
	return scheme === 'dark' ? colorsDark : colors
}

export const design = {
	colors,
	colorsDark,
	typography,
	spacing,
	radius,
	layout,
	shadow,
	getPalette,
} as const

export default design
