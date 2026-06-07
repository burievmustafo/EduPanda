/**
 * EduPanda mobile design tokens (Coursera UX patterns, original brand).
 * Source: edupath_mobile_coursera_ui_ux_complete.md §0.2–0.6
 */

export const colors = {
	primary: '#2563EB',
	primaryPressed: '#1D4ED8',
	primarySoft: '#DBEAFE',

	accentPurple: '#7C3AED',
	accentPurpleSoft: '#F2EAFE',

	success: '#2563EB',
	successSoft: '#DBEAFE',
	warning: '#F59E0B',
	danger: '#B42318',
	dangerSoft: '#FEE2E2',

	textPrimary: '#1F2328',
	textSecondary: '#5F6673',
	textTertiary: '#8A9099',

	background: '#FFFFFF',
	pageMuted: '#F5F6F8',
	surface: '#FFFFFF',
	surfaceMuted: '#F1F3F5',

	border: '#DADDE3',
	borderLight: '#ECEEF2',
	divider: '#E5E7EB',

	white: '#FFFFFF',
	black: '#000000',

	overlayDark: 'rgba(0,0,0,0.58)',
	videoOverlay: 'rgba(0,0,0,0.45)',

	tabActive: '#1F2328',
	tabInactive: '#3F454D',
} as const

export const colorsDark = {
	...colors,
	textPrimary: '#ECEDEE',
	textSecondary: '#B0B4BA',
	textTertiary: '#70777D',
	background: '#0D0F10',
	pageMuted: '#121416',
	surface: '#18191B',
	surfaceMuted: '#1C1F21',
	border: '#2E3135',
	borderLight: '#2A2D31',
	divider: '#2E3135',
	tabActive: '#ECEDEE',
	tabInactive: '#9BA1A6',
} as const

export const typography = {
	pageTitle: { fontSize: 40, lineHeight: 48, fontWeight: '800' as const },
	h1: { fontSize: 32, lineHeight: 40, fontWeight: '800' as const },
	h2: { fontSize: 24, lineHeight: 32, fontWeight: '800' as const },
	h3: { fontSize: 20, lineHeight: 28, fontWeight: '800' as const },
	title: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
	body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
	bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '700' as const },
	caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
	captionStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
	small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
	tabLabel: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const },
} as const

export type TypographyVariant = keyof typeof typography

export const spacing = {
	xxs: 2,
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	'2xl': 24,
	'3xl': 32,
	'4xl': 40,
	'5xl': 48,
	'6xl': 64,
} as const

export const radius = {
	xs: 4,
	sm: 6,
	md: 8,
	lg: 12,
	xl: 16,
	'2xl': 24,
	full: 999,
} as const

/** Layout sizes from Coursera reference (393dp base width). */
export const layout = {
	screenWidthRef: 393,
	screenPaddingHorizontal: 24,
	screenPaddingCompact: 16,
	authPaddingHorizontal: 32,
	appBarHeight: 64,
	tabBarHeight: 72,
	tabBarSafeAreaExtra: 16,
	primaryButtonHeight: 56,
	secondaryButtonHeight: 52,
	iconTouchSize: 48,
	iconVisualSize: 28,
	listRowMinHeight: 72,
	settingsRowHeight: 80,
	courseCardRadius: 12,
	bottomSheetTopRadius: 24,
	tabUnderlineHeight: 3,
	tabActivePillWidth: 72,
	tabActivePillHeight: 44,
} as const

export const shadow = {
	sm: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	md: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
} as const

/** Legacy alias — existing code uses Brand.primary */
export const Brand = {
	primary: colors.primary,
	primaryLight: colors.primarySoft,
	primaryDark: colors.primaryPressed,
	success: colors.success,
	successLight: colors.successSoft,
	danger: colors.danger,
	dangerLight: colors.dangerSoft,
	warning: colors.warning,
	gold: '#d97706',
} as const
