import { FIGMA_INBOX_THREADS, type InboxThread } from '@/lib/figma-inbox-threads'

export type ChatMessage = {
	id: string
	threadId: string
	text: string
	createdAt: number
	isOutgoing: boolean
}

export function getInboxThread(threadId: string): InboxThread | undefined {
	return FIGMA_INBOX_THREADS.find((t) => t.id === threadId)
}

/** Har thread uchun boshlang‘ich xabarlar (kirganda ko‘rinadi). */
export function getSeedMessages(threadId: string): ChatMessage[] {
	const thread = getInboxThread(threadId)
	if (!thread) return []

	const now = Date.now()
	const seeds: Record<string, ChatMessage[]> = {
		'1': [
			{
				id: `${threadId}-s1`,
				threadId,
				text: 'Hi! I submitted the layout exercise yesterday.',
				createdAt: now - 3600_000,
				isOutgoing: false,
			},
			{
				id: `${threadId}-s2`,
				threadId,
				text: thread.preview,
				createdAt: now - 120_000,
				isOutgoing: false,
			},
		],
		'2': [
			{
				id: `${threadId}-s1`,
				threadId,
				text: thread.preview,
				createdAt: now - 900_000,
				isOutgoing: false,
			},
		],
		'4': [
			{
				id: `${threadId}-s1`,
				threadId,
				text: 'こんにちは！モジュールの進捗はいかがですか？',
				createdAt: now - 10_800_000,
				isOutgoing: false,
			},
			{
				id: `${threadId}-s2`,
				threadId,
				text: thread.preview,
				createdAt: now - 3_600_000,
				isOutgoing: false,
			},
		],
	}

	return (
		seeds[threadId] ?? [
			{
				id: `${threadId}-s1`,
				threadId,
				text: thread.preview,
				createdAt: now - 600_000,
				isOutgoing: false,
			},
		]
	)
}

export function formatMessageTime(ts: number): string {
	if (!Number.isFinite(ts)) return ''
	const d = new Date(ts)
	if (Number.isNaN(d.getTime())) return ''
	const h = d.getHours()
	const m = d.getMinutes().toString().padStart(2, '0')
	const hour12 = h % 12 || 12
	const ampm = h < 12 ? 'AM' : 'PM'
	return `${hour12}:${m} ${ampm}`
}
