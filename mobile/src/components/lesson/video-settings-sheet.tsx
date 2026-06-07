import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

const SPEEDS = [1, 1.25, 1.5] as const

type VideoSettingsSheetProps = {
	visible: boolean
	playbackRate: number
	youtubeMode?: boolean
	onSelectRate: (rate: number) => void
	onClose: () => void
}

export function VideoSettingsSheet({
	visible,
	playbackRate,
	youtubeMode,
	onSelectRate,
	onClose,
}: VideoSettingsSheetProps) {
	const { t } = useTranslation()
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable
					style={[styles.sheet, { backgroundColor: palette.surface }]}
					onPress={(e) => e.stopPropagation()}>
					<AppText variant="h3">{t('lessonPlayer.settings')}</AppText>
					<AppText variant="caption" color="secondary">
						{t('lessonPlayer.playbackSpeed')}
					</AppText>
					{youtubeMode ? (
						<AppText variant="caption" color="tertiary">
							{t('lessonPlayer.speedYoutubeHint')}
						</AppText>
					) : (
						<View style={styles.speedRow}>
							{SPEEDS.map((speed) => {
								const active = playbackRate === speed
								return (
									<Pressable
										key={speed}
										onPress={() => onSelectRate(speed)}
										style={[
											styles.speedChip,
											{
												backgroundColor: active
													? colors.primarySoft
													: palette.surfaceMuted,
												borderColor: active ? colors.primary : palette.border,
											},
										]}>
										<AppText
											variant="bodyStrong"
											style={{ color: active ? colors.primary : palette.textPrimary }}>
											{speed}x
										</AppText>
									</Pressable>
								)
							})}
						</View>
					)}
					<AppButton title={t('courseDashboard.options.close')} variant="outline" onPress={onClose} />
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
		gap: spacing.lg,
	},
	speedRow: { flexDirection: 'row', gap: spacing.md },
	speedChip: {
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		borderWidth: 1,
	},
})
