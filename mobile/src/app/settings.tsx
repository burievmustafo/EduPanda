import { router } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet } from 'react-native'

import { SettingsGroup, ThemeOptionRow } from '@/components/settings'
import { Screen } from '@/components/screen'
import { AppText } from '@/components/ui/app-text'
import { SettingsRow } from '@/components/ui/settings-row'
import { spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useLocale } from '@/hooks/use-locale'
import { useLanguage } from '@/store/language-store'
import { useRemindersStore } from '@/store/reminders-store'
import { logOutToSplash } from '@/lib/auth-logout'
import { useThemeStore, type ThemePreference } from '@/store/theme-store'

const THEME_OPTIONS: Array<{
	key: ThemePreference
	icon: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline'
	labelKey: 'themeLight' | 'themeDark' | 'themeSystem'
	descKey?: 'themeSystemDesc'
}> = [
	{ key: 'light', icon: 'sunny-outline', labelKey: 'themeLight' },
	{ key: 'dark', icon: 'moon-outline', labelKey: 'themeDark' },
	{
		key: 'system',
		icon: 'phone-portrait-outline',
		labelKey: 'themeSystem',
		descKey: 'themeSystemDesc',
	},
]

export default function SettingsScreen() {
	const { t } = useTranslation()
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

	const remindersSubtitle =
		remindersHydrated && enabledCount > 0
			? t('settings.reminders.activeCount', { count: enabledCount })
			: t('settings.reminders.off')

	const currentThemeLabel = t(
		`settings.${THEME_OPTIONS.find((o) => o.key === preference)?.labelKey ?? 'themeSystem'}`,
	)
	const activeSchemeLabel =
		scheme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')

	return (
		<Screen edgesTop>
			<AppText variant="pageTitle" style={styles.title}>
				{t('settings.title')}
			</AppText>
			<AppText variant="caption" color="secondary" style={styles.subtitle}>
				{t('settings.subtitle')}
			</AppText>

			<SectionLabel label={t('settings.appearance')} />
			<AppText variant="caption" color="tertiary" style={styles.hint}>
				{t('settings.appearanceHint', { mode: currentThemeLabel, scheme: activeSchemeLabel })}
			</AppText>
			<SettingsGroup>
				{THEME_OPTIONS.map((option, index) => (
					<ThemeOptionRow
						key={option.key}
						icon={option.icon}
						label={t(`settings.${option.labelKey}`)}
						description={
							option.descKey ? t(`settings.${option.descKey}`) : undefined
						}
						selected={preference === option.key}
						onPress={() => void setPreference(option.key)}
						isLast={index === THEME_OPTIONS.length - 1}
					/>
				))}
			</SettingsGroup>

			<SectionLabel label={t('settings.language')} />
			<SettingsGroup>
				<SettingsRow
					icon="language-outline"
					label="English"
					subtitle={locale === 'en' ? t('settings.active') : undefined}
					showChevron={false}
					onPress={() => setLocale('en')}
				/>
				<SettingsRow
					icon="language-outline"
					label="日本語"
					subtitle={locale === 'ja' ? t('settings.active') : undefined}
					showChevron={false}
					onPress={() => setLocale('ja')}
				/>
			</SettingsGroup>

			<SectionLabel label={t('settings.notifications')} />
			<SettingsGroup>
				<SettingsRow
					icon="notifications-outline"
					label={t('settings.reminders.title')}
					subtitle={remindersSubtitle}
					onPress={() => router.push('/study-reminders')}
				/>
				<SettingsRow
					icon="mail-outline"
					label={t('settings.courseNotifications')}
					subtitle={t('settings.comingSoon')}
					showChevron={false}
				/>
			</SettingsGroup>

			<SectionLabel label={t('settings.account')} />
			<SettingsGroup>
				<SettingsRow
					icon="log-out-outline"
					label={t('settings.logOut')}
					subtitle={t('settings.logOutDesc')}
					onPress={() => {
						Alert.alert(t('settings.logOut'), t('settings.logOutConfirm'), [
							{ text: t('common.back'), style: 'cancel' },
							{
								text: t('settings.logOut'),
								style: 'destructive',
								onPress: () => void logOutToSplash(router),
							},
						])
					}}
				/>
			</SettingsGroup>

			<SectionLabel label={t('settings.about')} />
			<SettingsGroup>
				<SettingsRow icon="information-circle-outline" label={t('settings.version')} />
			</SettingsGroup>
		</Screen>
	)
}

function SectionLabel({ label }: { label: string }) {
	return (
		<AppText variant="captionStrong" color="secondary" style={styles.section}>
			{label.toUpperCase()}
		</AppText>
	)
}

const styles = StyleSheet.create({
	title: { marginBottom: spacing.xs },
	subtitle: { marginBottom: spacing.lg },
	hint: { marginBottom: spacing.md, marginTop: -spacing.xs },
	section: {
		marginTop: spacing['2xl'],
		marginBottom: spacing.sm,
		letterSpacing: 0.8,
	},
})
