import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Keyboard,
	StyleSheet,
	View,
} from 'react-native'
import { postAiCode, postAiConversation } from '@/api/ai'
import { AiEmptyState, AiHeader, AiMessageBubble } from '@/components/ai'
import { ChatComposer } from '@/components/inbox'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { getKeyboardBottomInset } from '@/lib/keyboard-inset'
import {
	aiMessageToApiPayload,
	newAiMessageId,
	type AiMessage,
	type AiMode,
} from '@/types/ai'

export default function AiTab() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const listRef = useRef<FlatList<AiMessage>>(null)

	const [mode, setMode] = useState<AiMode>('conversation')
	const [messages, setMessages] = useState<AiMessage[]>([])
	const [loading, setLoading] = useState(false)
	const [keyboardInset, setKeyboardInset] = useState(0)
	const [keyboardVisible, setKeyboardVisible] = useState(false)

	const scrollToEnd = useCallback(() => {
		listRef.current?.scrollToEnd({ animated: true })
	}, [])

	useEffect(() => {
		const show = Keyboard.addListener('keyboardDidShow', (e) => {
			setKeyboardInset(getKeyboardBottomInset(e))
			setKeyboardVisible(true)
		})
		const hide = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardInset(0)
			setKeyboardVisible(false)
		})
		return () => {
			show.remove()
			hide.remove()
		}
	}, [])

	useEffect(() => {
		if (messages.length > 0) {
			const tmr = setTimeout(scrollToEnd, 50)
			return () => clearTimeout(tmr)
		}
	}, [messages.length, scrollToEnd])

	useEffect(() => {
		if (keyboardInset > 0 && messages.length > 0) {
			const tmr = setTimeout(scrollToEnd, 120)
			return () => clearTimeout(tmr)
		}
	}, [keyboardInset, messages.length, scrollToEnd])

	const handleModeChange = (next: AiMode) => {
		if (next === mode) return
		setMode(next)
		setMessages([])
	}

	const handleClear = () => {
		if (!messages.length) return
		Alert.alert(t('ai.clearChat'), t('ai.clearChatConfirm'), [
			{ text: t('payment.cancel'), style: 'cancel' },
			{
				text: t('ai.clear'),
				style: 'destructive',
				onPress: () => setMessages([]),
			},
		])
	}

	const handleSend = async (text: string) => {
		if (loading) return

		const userMsg: AiMessage = {
			id: newAiMessageId(),
			role: 'user',
			content: text,
			createdAt: Date.now(),
		}
		const nextMessages = [...messages, userMsg]
		setMessages(nextMessages)
		setLoading(true)

		try {
			const payload = aiMessageToApiPayload(nextMessages)
			const reply =
				mode === 'conversation'
					? await postAiConversation(payload)
					: await postAiCode(payload)

			setMessages((prev) => [
				...prev,
				{
					id: newAiMessageId(),
					role: 'assistant',
					content: typeof reply === 'string' ? reply : String(reply),
					createdAt: Date.now(),
				},
			])
			setTimeout(scrollToEnd, 80)
		} catch (err) {
			setMessages(messages)
			Alert.alert(t('ai.errorTitle'), (err as Error).message)
		} finally {
			setLoading(false)
		}
	}

	const placeholder =
		mode === 'code' ? t('ai.codePlaceholder') : t('ai.conversationPlaceholder')

	return (
		<View style={[styles.screen, { backgroundColor: theme.background }]}>
			<AiHeader
				mode={mode}
				onModeChange={handleModeChange}
				onClear={handleClear}
				canClear={messages.length > 0}
			/>

			<View style={styles.body}>
				{messages.length === 0 && !loading && !keyboardVisible ? (
					<AiEmptyState mode={mode} />
				) : (
					<FlatList
						ref={listRef}
						data={messages}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<AiMessageBubble message={item} isCodeMode={mode === 'code'} />
						)}
						contentContainerStyle={{
							paddingTop: spacing.sm,
							paddingBottom: spacing.md,
						}}
						onContentSizeChange={() => scrollToEnd()}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="on-drag"
						showsVerticalScrollIndicator={false}
					/>
				)}

				{loading ? (
					<View style={styles.loadingRow}>
						<ActivityIndicator color={theme.accent} />
						<AppText variant="small" style={{ color: theme.textMuted, marginLeft: spacing.sm }}>
							{t('ai.thinking')}
						</AppText>
					</View>
				) : null}
			</View>

			<ChatComposer
				onSend={(text) => void handleSend(text)}
				disabled={loading}
				keyboardInset={keyboardInset}
				placeholder={placeholder}
				adjustForTabBar
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	body: { flex: 1 },
	loadingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: spacing.sm,
	},
})
