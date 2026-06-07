import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	FlatList,
	Keyboard,
	StyleSheet,
	View,
} from 'react-native'

import { ChatComposer, ChatHeader, ChatMessageBubble } from '@/components/inbox'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { getInboxThread } from '@/lib/inbox-chat'
import { getKeyboardBottomInset } from '@/lib/keyboard-inset'
import type { ChatMessage } from '@/lib/inbox-chat'
import { useInboxMessages } from '@/store/inbox-messages-store'

function resolveThreadId(raw: string | string[] | undefined): string {
	if (Array.isArray(raw)) return raw[0] ?? ''
	if (typeof raw === 'string') return raw
	return ''
}

export default function ChatThreadScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { threadId: threadIdParam } = useLocalSearchParams<{
		threadId: string | string[]
	}>()
	const id = resolveThreadId(threadIdParam)
	const thread = getInboxThread(id)

	const listRef = useRef<FlatList<ChatMessage>>(null)
	const [sending, setSending] = useState(false)
	const [keyboardInset, setKeyboardInset] = useState(0)
	const scrollPending = useRef(false)

	const hydrate = useInboxMessages((s) => s.hydrate)
	const ensureThread = useInboxMessages((s) => s.ensureThread)
	const rawMessages = useInboxMessages((s) => s.byThread[id])
	const messages = useMemo(() => rawMessages ?? [], [rawMessages])
	const sendMessage = useInboxMessages((s) => s.sendMessage)
	const addIncomingReply = useInboxMessages((s) => s.addIncomingReply)
	const hydrated = useInboxMessages((s) => s.hydrated)

	useEffect(() => {
		void hydrate()
	}, [hydrate])

	useEffect(() => {
		if (hydrated && id) ensureThread(id)
	}, [hydrated, id, ensureThread])

	useEffect(() => {
		const onShow = Keyboard.addListener('keyboardDidShow', (e) => {
			setKeyboardInset(getKeyboardBottomInset(e))
		})
		const onHide = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardInset(0)
		})

		return () => {
			onShow.remove()
			onHide.remove()
		}
	}, [])

	const scrollToEnd = useCallback(() => {
		if (messages.length === 0 || scrollPending.current) return
		scrollPending.current = true
		requestAnimationFrame(() => {
			try {
				listRef.current?.scrollToEnd({ animated: false })
			} catch {
				// FlatList hali layout bo‘lmagan bo‘lishi mumkin
			} finally {
				scrollPending.current = false
			}
		})
	}, [messages.length])

	useEffect(() => {
		if (messages.length > 0) {
			const tmr = setTimeout(scrollToEnd, 50)
			return () => clearTimeout(tmr)
		}
	}, [messages.length, scrollToEnd])

	useEffect(() => {
		if (keyboardInset > 0 && messages.length > 0) {
			const tmr = setTimeout(scrollToEnd, 100)
			return () => clearTimeout(tmr)
		}
	}, [keyboardInset, messages.length, scrollToEnd])

	useEffect(() => {
		if (!hydrated || thread) return
		const tmr = setTimeout(() => router.back(), 0)
		return () => clearTimeout(tmr)
	}, [hydrated, thread])

	if (!thread) {
		return (
			<View style={[styles.screen, { backgroundColor: theme.background }]}>
				<Stack.Screen options={{ headerShown: false }} />
			</View>
		)
	}

	const handleSend = async (text: string) => {
		if (sending) return
		setSending(true)
		try {
			await sendMessage(id, text)
			setTimeout(scrollToEnd, 80)
			setTimeout(() => {
				void addIncomingReply(id, t('inbox.autoReply'))
			}, 900)
		} finally {
			setSending(false)
		}
	}

	return (
		<View style={[styles.screen, { backgroundColor: theme.background }]}>
			<Stack.Screen options={{ headerShown: false }} />
			<ChatHeader
				thread={thread}
				onBack={() => router.back()}
				backLabel={t('common.back')}
			/>

			<FlatList
				ref={listRef}
				style={styles.listFlex}
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <ChatMessageBubble message={item} />}
				contentContainerStyle={styles.list}
				onContentSizeChange={() => scrollToEnd()}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
				showsVerticalScrollIndicator={false}
			/>

			<ChatComposer
				onSend={(text) => void handleSend(text)}
				disabled={sending}
				keyboardInset={keyboardInset}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	listFlex: {
		flex: 1,
	},
	list: {
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		flexGrow: 1,
		justifyContent: 'flex-end',
	},
})
