import DateTimePicker from '@react-native-community/datetimepicker'
import { Stack, router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native'

import { SettingsGroup, StudyReminderRow } from '@/components/settings'
import { Screen } from '@/components/screen'
import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import { ensureNotificationPermissions } from '@/lib/study-notifications'
import { useRemindersStore, type Weekday } from '@/store/reminders-store'

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

function formatTimeLocal(date: Date): string {
	const h = `${date.getHours()}`.padStart(2, '0')
	const m = `${date.getMinutes()}`.padStart(2, '0')
	return `${h}:${m}`
}

function parseTimeLocal(time: string): Date {
	const [h, m] = time.split(':').map((v) => parseInt(v, 10))
	const d = new Date()
	d.setHours(h || 9, m || 0, 0, 0)
	return d
}

function displayTime(time: string | null, chooseLabel: string) {
	return time ?? chooseLabel
}

export default function StudyRemindersScreen() {
	const { t } = useTranslation()
	const scheme = useColorScheme()
	const palette = getPalette(scheme)
	const days = useRemindersStore((s) => s.days)
	const hydrate = useRemindersStore((s) => s.hydrate)
	const setDayEnabled = useRemindersStore((s) => s.setDayEnabled)
	const resetAll = useRemindersStore((s) => s.resetAll)

	const [pickerDay, setPickerDay] = useState<Weekday | null>(null)
	const [pickerValue, setPickerValue] = useState(new Date())
	const [androidPickerVisible, setAndroidPickerVisible] = useState(false)

	useEffect(() => {
		void hydrate()
	}, [hydrate])

	const dayLabel = useCallback(
		(weekday: Weekday) => t(`settings.reminders.days.${weekday}`),
		[t],
	)

	const confirmReset = () => {
		Alert.alert(t('settings.reminders.resetTitle'), t('settings.reminders.resetDesc'), [
			{ text: t('common.back'), style: 'cancel' },
			{
				text: t('settings.reminders.resetAction'),
				style: 'destructive',
				onPress: () => void resetAll(),
			},
		])
	}

	const applyTime = async (weekday: Weekday, date: Date) => {
		const time = formatTimeLocal(date)
		const ok = await setDayEnabled(weekday, true, time)
		if (!ok) {
			Alert.alert(t('settings.reminders.permissionTitle'), t('settings.reminders.permissionDenied'))
			await setDayEnabled(weekday, false)
		}
	}

	const onToggle = async (weekday: Weekday, enabled: boolean) => {
		if (!enabled) {
			await setDayEnabled(weekday, false)
			return
		}

		const granted = await ensureNotificationPermissions()
		if (!granted) {
			Alert.alert(
				t('settings.reminders.permissionTitle'),
				t('settings.reminders.permissionDenied'),
			)
			return
		}

		const existing = days.find((d) => d.weekday === weekday)
		setPickerValue(parseTimeLocal(existing?.time ?? '09:00'))
		setPickerDay(weekday)
		if (Platform.OS === 'android') {
			setAndroidPickerVisible(true)
		}
	}

	const closePicker = () => {
		setPickerDay(null)
		setAndroidPickerVisible(false)
	}

	return (
		<Screen edgesTop>
			<Stack.Screen options={{ title: t('settings.reminders.title') }} />

			<AppText variant="pageTitle">{t('settings.reminders.title')}</AppText>
			<AppText variant="body" color="secondary" style={styles.intro}>
				{t('settings.reminders.intro')}
			</AppText>

			<Pressable onPress={confirmReset} hitSlop={8}>
				<AppText variant="bodyStrong" color="brand" style={styles.resetLink}>
					{t('settings.reminders.resetAll')}
				</AppText>
			</Pressable>

			<SettingsGroup style={styles.group}>
				{WEEKDAYS.map((weekday, index) => {
					const day = days.find((d) => d.weekday === weekday)!
					return (
						<StudyReminderRow
							key={weekday}
							weekday={weekday}
							label={dayLabel(weekday)}
							subtitle={displayTime(
								day.time,
								t('settings.reminders.chooseTime'),
							)}
							enabled={day.enabled}
							onToggle={(enabled) => void onToggle(weekday, enabled)}
							isLast={index === WEEKDAYS.length - 1}
						/>
					)
				})}
			</SettingsGroup>

			{pickerDay !== null && Platform.OS === 'ios' ? (
				<Modal transparent animationType="slide" onRequestClose={closePicker}>
					<View style={styles.modalBackdrop}>
						<View style={[styles.modalSheet, { backgroundColor: palette.surface }]}>
							<AppText variant="h3">{dayLabel(pickerDay)}</AppText>
							<DateTimePicker
								value={pickerValue}
								mode="time"
								display="spinner"
								onChange={(_, date) => {
									if (date) setPickerValue(date)
								}}
							/>
							<View style={styles.modalActions}>
								<AppButton
									title={t('common.back')}
									variant="outline"
									onPress={() => {
										if (pickerDay !== null) void setDayEnabled(pickerDay, false)
										closePicker()
									}}
									fullWidth={false}
									style={styles.modalBtn}
								/>
								<AppButton
									title={t('common.submit')}
									onPress={() => {
										void applyTime(pickerDay, pickerValue)
										closePicker()
									}}
									fullWidth={false}
									style={styles.modalBtn}
								/>
							</View>
						</View>
					</View>
				</Modal>
			) : null}

			{pickerDay !== null && Platform.OS === 'android' && androidPickerVisible ? (
				<DateTimePicker
					value={pickerValue}
					mode="time"
					onChange={async (event, date) => {
						setAndroidPickerVisible(false)
						if (event.type === 'set' && date && pickerDay !== null) {
							await applyTime(pickerDay, date)
						} else if (pickerDay !== null) {
							await setDayEnabled(pickerDay, false)
						}
						closePicker()
					}}
				/>
			) : null}

			<AppButton
				title={t('common.back')}
				variant="ghost"
				onPress={() => router.back()}
				style={styles.backBtn}
			/>
		</Screen>
	)
}

const styles = StyleSheet.create({
	intro: { marginBottom: spacing.lg },
	resetLink: { marginBottom: spacing['2xl'] },
	group: { marginBottom: spacing['2xl'] },
	modalBackdrop: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.45)',
	},
	modalSheet: {
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		padding: spacing['2xl'],
		gap: spacing.md,
	},
	modalActions: { flexDirection: 'row', gap: spacing.md },
	modalBtn: { flex: 1 },
	backBtn: { marginTop: spacing.md },
})
