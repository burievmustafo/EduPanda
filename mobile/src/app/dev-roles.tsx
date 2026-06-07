import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { Screen } from '@/components/screen'
import { AppText } from '@/components/ui/app-text'
import { AppButton } from '@/components/ui/app-button'
import { LanguageToggle } from '@/components/language-toggle'
import { spacing } from '@/design/tokens'
import { useSession } from '@/store/session-store'

/** Instructor demo entry (not in Figma student flow). */
export default function DevRolesScreen() {
	const { t } = useTranslation()
	const setRole = useSession((s) => s.setRole)

	return (
		<Screen edgesTop>
			<View style={styles.header}>
				<AppText variant="h1">EduPanda</AppText>
				<LanguageToggle />
			</View>

			<View style={styles.body}>
				<AppText variant="h2">{t('role.chooseRole')}</AppText>
				<AppText variant="caption" color="secondary">
					{t('role.subtitle')}
				</AppText>

				<View style={styles.buttons}>
					<AppButton
						title={t('role.student')}
						onPress={() => {
							setRole('student')
							router.replace('/(tabs)/home')
						}}
					/>
					<AppButton
						title={t('role.instructor')}
						variant="secondary"
						onPress={() => {
							setRole('instructor')
							router.replace('/teacher')
						}}
					/>
					<AppButton
						title={t('common.back')}
						variant="ghost"
						onPress={() => router.back()}
					/>
				</View>
			</View>
		</Screen>
	)
}

const styles = StyleSheet.create({
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	body: { gap: spacing.lg, marginTop: spacing['5xl'] },
	buttons: { gap: spacing.sm, marginTop: spacing.lg },
})
