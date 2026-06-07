import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { TextField } from '@/components/text-field'
import { colors, radius, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import { formatTime } from '@/lib/localized'

type NoteEditorSheetProps = {
	visible: boolean
	timeSec: number
	value: string
	onChangeText: (text: string) => void
	onSave: () => void
	onClose: () => void
}

export function NoteEditorSheet({
	visible,
	timeSec,
	value,
	onChangeText,
	onSave,
	onClose,
}: NoteEditorSheetProps) {
	const { t } = useTranslation()
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable
					style={[styles.sheet, { backgroundColor: palette.surface }]}
					onPress={(e) => e.stopPropagation()}>
					<AppText variant="h3">{t('lesson.addNote')}</AppText>
					<AppText variant="caption" color="brand">
						{t('lesson.resumeAt')} {formatTime(timeSec)}
					</AppText>
					<TextField
						placeholder={t('lesson.notePlaceholder')}
						value={value}
						onChangeText={onChangeText}
						multiline
					/>
					<View style={styles.actions}>
						<AppButton
							title={t('courseDashboard.options.close')}
							variant="outline"
							onPress={onClose}
							fullWidth={false}
							style={styles.flex}
						/>
						<AppButton
							title={t('lesson.addNote')}
							onPress={onSave}
							disabled={!value.trim()}
							fullWidth={false}
							style={styles.flex}
						/>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: colors.overlayDark,
		justifyContent: 'flex-end',
	},
	sheet: {
		borderTopLeftRadius: radius['2xl'],
		borderTopRightRadius: radius['2xl'],
		padding: spacing['2xl'],
		gap: spacing.md,
	},
	actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
	flex: { flex: 1 },
})
