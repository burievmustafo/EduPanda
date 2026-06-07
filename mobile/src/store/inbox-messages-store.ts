import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import { getSeedMessages, type ChatMessage } from '@/lib/inbox-chat'

const STORAGE_KEY = '@edupanda/inbox_messages'

type MessagesMap = Record<string, ChatMessage[]>

type InboxMessagesState = {
	byThread: MessagesMap
	hydrated: boolean
	hydrate: () => Promise<void>
	ensureThread: (threadId: string) => void
	getMessages: (threadId: string) => ChatMessage[]
	sendMessage: (threadId: string, text: string) => Promise<ChatMessage>
	addIncomingReply: (threadId: string, text: string) => Promise<void>
	getLastPreview: (threadId: string) => string | undefined
}

function newId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

async function persist(map: MessagesMap) {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function normalizeMap(raw: unknown): MessagesMap {
	if (!raw || typeof raw !== 'object') return {}
	const out: MessagesMap = {}
	for (const [threadId, list] of Object.entries(raw as MessagesMap)) {
		if (!Array.isArray(list)) continue
		out[threadId] = list
			.filter((m) => m && typeof m.text === 'string')
			.map((m) => ({
				id: String(m.id ?? newId()),
				threadId: String(m.threadId ?? threadId),
				text: String(m.text),
				createdAt:
					typeof m.createdAt === 'number' && Number.isFinite(m.createdAt)
						? m.createdAt
						: Date.now(),
				isOutgoing: Boolean(m.isOutgoing),
			}))
	}
	return out
}

export const useInboxMessages = create<InboxMessagesState>((set, get) => ({
	byThread: {},
	hydrated: false,

	hydrate: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY)
			const parsed = raw ? normalizeMap(JSON.parse(raw)) : {}
			set({ byThread: parsed, hydrated: true })
		} catch {
			set({ byThread: {}, hydrated: true })
		}
	},

	ensureThread: (threadId: string) => {
		const existing = get().byThread[threadId]
		if (existing?.length) return
		const seeded = getSeedMessages(threadId)
		const next = { ...get().byThread, [threadId]: seeded }
		set({ byThread: next })
		void persist(next)
	},

	getMessages: (threadId: string) => get().byThread[threadId] ?? [],

	sendMessage: async (threadId: string, text: string) => {
		const trimmed = text.trim()
		if (!trimmed) throw new Error('empty')

		const msg: ChatMessage = {
			id: newId(),
			threadId,
			text: trimmed,
			createdAt: Date.now(),
			isOutgoing: true,
		}
		const list = [...(get().byThread[threadId] ?? []), msg]
		const next = { ...get().byThread, [threadId]: list }
		set({ byThread: next })
		await persist(next)
		return msg
	},

	addIncomingReply: async (threadId: string, text: string) => {
		const msg: ChatMessage = {
			id: newId(),
			threadId,
			text,
			createdAt: Date.now(),
			isOutgoing: false,
		}
		const list = [...(get().byThread[threadId] ?? []), msg]
		const next = { ...get().byThread, [threadId]: list }
		set({ byThread: next })
		await persist(next)
	},

	getLastPreview: (threadId: string) => {
		const list = get().byThread[threadId]
		if (!list?.length) return undefined
		return list[list.length - 1]?.text
	},
}))
