import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { colors, radius, spacing } from '@/design/tokens'
import { unenrollCourse } from '@/api/learning'

type CourseOptionsSheetProps = {
	visible: boolean
	courseId: string
	onClose: () => void
	onUnenrolled: () => void
	onLeaveReview: () => void
}

function OptionRow({
	icon,
	label,
	subtitle,
	onPress,
	danger,
}: {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	subtitle?: string
	onPress: () => void
	danger?: boolean
}) {
	const theme = useFigmaTheme()

	return (
		<Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { opacity: 0.85 }]}>
			<View style={[styles.iconWrap, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name={icon} size={24} color={danger ? theme.danger : theme.accent} />
			</View>
			<View style={styles.optionText}>
				<AppText
					variant="bodyStrong"
					style={{ color: danger ? theme.danger : theme.heading }}>
					{label}
				</AppText>
				{subtitle ? (
					<AppText variant="caption" style={{ color: theme.textMuted }}>
						{subtitle}
					</AppText>
				) : null}
			</View>
			<Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
		</Pressable>
	)
}

export function CourseOptionsSheet({
	visible,
	courseId,
	onClose,
	onUnenrolled,
	onLeaveReview,
}: CourseOptionsSheetProps) {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(false)

	const handleUnenroll = () => {
		Alert.alert(
			t('courseDashboard.options.unenroll'),
			t('courseDashboard.options.unenrollConfirm'),
			[
				{ text: t('common.back'), style: 'cancel' },
				{
					text: t('courseDashboard.options.unenroll'),
					style: 'destructive',
					onPress: async () => {
						setLoading(true)
						try {
							await unenrollCourse(courseId)
							onClose()
							onUnenrolled()
						} catch (err) {
							Alert.alert(t('common.error'), (err as Error).message)
						} finally {
							setLoading(false)
						}
					},
				},
			],
		)
	}

	const theme = useFigmaTheme()

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable
					style={[styles.sheet, { backgroundColor: theme.surface }]}
					onPress={(e) => e.stopPropagation()}>
					<AppText variant="h3" style={[styles.sheetTitle, { color: theme.heading }]}>
						{t('courseDashboard.options.title')}
					</AppText>
					<OptionRow
						icon="star-outline"
						label={t('courseDashboard.review.menuTitle')}
						subtitle={t('courseDashboard.review.menuSubtitle')}
						onPress={() => {
							onClose()
							onLeaveReview()
						}}
					/>
					<OptionRow
						icon="exit-outline"
						label={t('courseDashboard.options.unenroll')}
						subtitle={t('courseDashboard.options.unenrollSub')}
						onPress={handleUnenroll}
						danger
					/>
					<AppButton
						title={loading ? '...' : t('courseDashboard.options.close')}
						variant="outline"
						onPress={onClose}
						style={styles.closeBtn}
					/>
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
		paddingTop: spacing['3xl'],
		paddingHorizontal: spacing['2xl'],
		paddingBottom: spacing['4xl'],
		minHeight: 200,
	},
	sheetTitle: { marginBottom: spacing['2xl'] },
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 60,
		gap: spacing.lg,
		marginBottom: spacing.sm,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	optionText: { flex: 1, gap: 2 },
	closeBtn: { marginTop: spacing['2xl'] },
})
