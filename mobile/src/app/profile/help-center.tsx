import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { ProfileInfoCard, ProfileSubpage } from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { figmaLight, useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useLocale } from '@/hooks/use-locale'
import { useLanguage } from '@/store/language-store'
import { useRemindersStore } from '@/store/reminders-store'
import { useThemeStore, type ThemePreference } from '@/store/theme-store'

const THEME_OPTIONS: Array<{
	key: ThemePreference
	icon: keyof typeof Ionicons.glyphMap
	labelKey: 'themeLight' | 'themeDark' | 'themeSystem'
}> = [
	{ key: 'light', icon: 'sunny-outline', labelKey: 'themeLight' },
	{ key: 'dark', icon: 'moon-outline', labelKey: 'themeDark' },
	{ key: 'system', icon: 'phone-portrait-outline', labelKey: 'themeSystem' },
]

export default function HelpCenterScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const locale = useLocale()
	const scheme = useColorScheme()
	const setLocale = useLanguage((s) => s.setLocale)
	const preference = useThemeStore((s) => s.preference)
	const setPreference = useThemeStore((s) => s.setPreference)
	const hydrateTheme = useThemeStore((s) => s.hydrate)
	const hydrateReminders = useRemindersStore((s) => s.hydrate)
	const enabledCount = useRemindersStore((s) => s.enabledCount())
	const remindersHydrated = useRemindersStore((s) => s.hydrated)

	useEffect(() => {
		void hydrateTheme()
		void hydrateReminders()
	}, [hydrateTheme, hydrateReminders])

	const currentThemeLabel = t(
		`settings.${THEME_OPTIONS.find((option) => option.key === preference)?.labelKey ?? 'themeSystem'}`,
	)
	const activeSchemeLabel =
		scheme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')
	const remindersSubtitle =
		remindersHydrated && enabledCount > 0
			? t('settings.reminders.activeCount', { count: enabledCount })
			: t('settings.reminders.off')

	return (
		<ProfileSubpage title={t('settings.title')}>
			<ProfileInfoCard>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]}>
					{t('settings.title')}
				</AppText>
				<AppText variant="body" style={[styles.desc, { color: theme.textMuted }]}>
					{t('settings.subtitle')}
				</AppText>
			</ProfileInfoCard>

			<SectionLabel label={t('settings.appearance')} />
			<AppText variant="small" style={[styles.hint, { color: theme.textMuted }]}>
				{t('settings.appearanceHint', { mode: currentThemeLabel, scheme: activeSchemeLabel })}
			</AppText>
			<View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.notificationCardBg }]}>
				{THEME_OPTIONS.map((option) => (
					<HelpRow
						key={option.key}
						icon={option.icon}
						title={t(`settings.${option.labelKey}`)}
						subtitle={option.key === 'system' ? t('settings.themeSystemDesc') : undefined}
						selected={preference === option.key}
						onPress={() => void setPreference(option.key)}
						theme={theme}
					/>
				))}
			</View>

			<SectionLabel label={t('settings.language')} />
			<View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.notificationCardBg }]}>
				<HelpRow
					icon="language-outline"
					title="English"
					subtitle={locale === 'en' ? t('settings.active') : undefined}
					selected={locale === 'en'}
					onPress={() => setLocale('en')}
					theme={theme}
				/>
				<HelpRow
					icon="language-outline"
					title="日本語"
					subtitle={locale === 'ja' ? t('settings.active') : undefined}
					selected={locale === 'ja'}
					onPress={() => setLocale('ja')}
					theme={theme}
				/>
			</View>

			<SectionLabel label={t('settings.notifications')} />
			<View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.notificationCardBg }]}>
				<HelpRow
					icon="notifications-outline"
					title={t('settings.reminders.title')}
					subtitle={remindersSubtitle}
					onPress={() => router.push('/study-reminders')}
					theme={theme}
				/>
				<HelpRow
					icon="mail-outline"
					title={t('settings.courseNotifications')}
					subtitle={t('settings.comingSoon')}
					showChevron={false}
					onPress={() => undefined}
					theme={theme}
				/>
			</View>

			<SectionLabel label={t('settings.about')} />
			<View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.notificationCardBg }]}>
				<HelpRow
					icon="information-circle-outline"
					title={t('settings.version')}
					showChevron={false}
					onPress={() => undefined}
					theme={theme}
				/>
			</View>
		</ProfileSubpage>
	)
}

function HelpRow({
	icon,
	title,
	subtitle,
	onPress,
	selected,
	showChevron = true,
	theme,
}: {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	subtitle?: string
	onPress: () => void
	selected?: boolean
	showChevron?: boolean
	theme: ReturnType<typeof useFigmaTheme>
}) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				{ borderBottomColor: theme.progressTrack },
				pressed && styles.pressed,
			]}>
			<View style={[styles.iconWrap, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name={icon} size={21} color={theme.accent} />
			</View>
			<View style={styles.textCol}>
				<AppText variant="bodyStrong" style={[styles.rowText, { color: theme.heading }]}>
					{title}
				</AppText>
				{subtitle ? (
					<AppText variant="small" style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={2}>
						{subtitle}
					</AppText>
				) : null}
			</View>
			{selected ? (
				<Ionicons name="checkmark-circle" size={22} color={theme.accent} />
			) : showChevron ? (
				<Ionicons name="chevron-forward" size={22} color={theme.accent} />
			) : null}
		</Pressable>
	)
}

function SectionLabel({ label }: { label: string }) {
	const theme = useFigmaTheme()
	return (
		<AppText variant="captionStrong" style={[styles.sectionLabel, { color: theme.textMuted }]}>
			{label.toUpperCase()}
		</AppText>
	)
}

const styles = StyleSheet.create({
	title: {
		color: figmaLight.heading,
		fontWeight: '800',
	},
	desc: {
		color: figmaLight.textMuted,
		marginTop: spacing.sm,
		lineHeight: 22,
	},
	hint: {
		color: figmaLight.textMuted,
		marginBottom: spacing.sm,
		lineHeight: 18,
	},
	sectionLabel: {
		color: figmaLight.textMuted,
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
		letterSpacing: 0.8,
	},
	group: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: figmaLight.notificationCardBg,
		backgroundColor: figmaLight.background,
		overflow: 'hidden',
		marginBottom: spacing.md,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 66,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: figmaLight.progressTrack,
	},
	iconWrap: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: figmaLight.notificationCardBg,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	textCol: { flex: 1 },
	rowText: {
		color: figmaLight.heading,
		fontSize: 14,
	},
	subtitle: {
		color: figmaLight.textMuted,
		marginTop: 2,
		fontSize: 11,
	},
	pressed: { opacity: 0.88 },
})
