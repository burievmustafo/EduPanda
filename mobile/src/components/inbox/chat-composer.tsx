import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Keyboard,
	Platform,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useFigmaTheme } from '@/design/figma-theme'
import { layout, spacing } from '@/design/tokens'

type Props = {
	onSend: (text: string) => void
	disabled?: boolean
	/** Klaviatura ochiq bo‘lganda composer pastidan ko‘tarish (px). */
	keyboardInset?: number
	placeholder?: string
	/** Pastki tab bar bor ekranlar (AI inbox) — iOS da marginni moslashtiradi. */
	adjustForTabBar?: boolean
}

export function ChatComposer({
	onSend,
	disabled,
	keyboardInset = 0,
	placeholder,
	adjustForTabBar = false,
}: Props) {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const [text, setText] = useState('')

	const [androidKbVisible, setAndroidKbVisible] = useState(false)
	useEffect(() => {
		if (Platform.OS !== 'android') return
		const s = Keyboard.addListener('keyboardDidShow', () => setAndroidKbVisible(true))
		const h = Keyboard.addListener('keyboardDidHide', () => setAndroidKbVisible(false))
		return () => {
			s.remove()
			h.remove()
		}
	}, [])

	const keyboardOpen = keyboardInset > 0
	const restingBottomPad = Math.max(insets.bottom, androidKbVisible ? spacing.md : spacing.sm)
	const bottomPad = keyboardOpen ? 0 : restingBottomPad

	let lift = keyboardOpen ? keyboardInset : 0
	if (lift > 0 && adjustForTabBar && Platform.OS === 'ios') {
		lift = Math.max(0, lift - layout.tabBarHeight)
	}

	const submit = () => {
		const trimmed = text.trim()
		if (!trimmed || disabled) return
		onSend(trimmed)
		setText('')
		Keyboard.dismiss()
	}

	const canSend = text.trim().length > 0 && !disabled

	return (
		<View
			style={[
				styles.wrap,
				{
					paddingBottom: bottomPad,
					marginBottom: lift,
					borderTopColor: theme.progressTrack,
					backgroundColor: theme.background,
				},
			]}>
			<View
				style={[
					styles.bar,
					{
						backgroundColor: theme.surface,
						borderColor: theme.progressTrack,
					},
				]}>
				<TextInput
					value={text}
					onChangeText={setText}
					placeholder={placeholder ?? t('inbox.messagePlaceholder')}
					placeholderTextColor={theme.textMuted}
					style={[styles.input, { color: theme.heading }]}
					multiline
					maxLength={2000}
					editable={!disabled}
					returnKeyType="send"
					blurOnSubmit={false}
					onSubmitEditing={submit}
				/>
				<Pressable
					onPress={submit}
					disabled={!canSend}
					style={[
						styles.sendBtn,
						{ backgroundColor: canSend ? theme.tabActiveBg : theme.progressTrack },
					]}
					accessibilityRole="button"
					accessibilityLabel={t('inbox.send')}>
					<Ionicons
						name="send"
						size={20}
						color={canSend ? theme.buttonText : theme.textMuted}
					/>
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingTop: spacing.sm,
		paddingHorizontal: spacing.md,
	},
	bar: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: spacing.sm,
		borderWidth: 1,
		borderRadius: 24,
		paddingLeft: spacing.md,
		paddingRight: spacing.xs,
		paddingVertical: spacing.xs,
		minHeight: 44,
		maxHeight: 120,
	},
	input: {
		flex: 1,
		fontSize: 14,
		paddingVertical: spacing.sm,
		maxHeight: 96,
	},
	sendBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 2,
	},
})
