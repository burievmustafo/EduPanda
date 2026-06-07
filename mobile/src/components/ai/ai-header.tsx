import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { AiMode } from '@/types/ai'

type Props = {
	mode: AiMode
	onModeChange: (mode: AiMode) => void
	onClear: () => void
	canClear: boolean
}

export function AiHeader({ mode, onModeChange, onClear, canClear }: Props) {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	const modes: { id: AiMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
		{ id: 'conversation', label: t('ai.conversation'), icon: 'chatbubble-ellipses-outline' },
		{ id: 'code', label: t('ai.generateCode'), icon: 'code-slash-outline' },
	]

	return (
		<View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
			<View style={styles.titleRow}>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
					{t('ai.title')}
				</AppText>
				{canClear ? (
					<Pressable
						onPress={onClear}
						hitSlop={12}
						style={[styles.clearBtn, { backgroundColor: theme.notificationCardBg }]}
						accessibilityLabel={t('ai.clearChat')}>
						<Ionicons name="trash-outline" size={20} color={theme.textMuted} />
					</Pressable>
				) : null}
			</View>

			<View style={styles.tabs}>
				{modes.map((item) => {
					const active = mode === item.id
					return (
						<Pressable
							key={item.id}
							onPress={() => onModeChange(item.id)}
							style={[
								styles.tab,
								{
									backgroundColor: active ? theme.tabActiveBg : theme.notificationCardBg,
								},
							]}>
							<Ionicons
								name={item.icon}
								size={18}
								color={active ? theme.buttonText : theme.accent}
							/>
							<AppText
								variant="small"
								style={{
									color: active ? theme.buttonText : theme.heading,
									fontWeight: '700',
								}}>
								{item.label}
							</AppText>
						</Pressable>
					)
				})}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: spacing.md,
	},
	title: {
		fontSize: 21,
		fontWeight: '700',
		letterSpacing: 1.05,
		flex: 1,
	},
	clearBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabs: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	tab: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.sm,
		borderRadius: 10,
	},
})
