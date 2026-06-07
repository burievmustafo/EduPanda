export type AiMode = 'conversation' | 'code'

export type AiMessage = {
	id: string
	role: 'user' | 'assistant'
	content: string
	createdAt: number
}

export function aiMessageToApiPayload(
	messages: AiMessage[],
): { role: 'user' | 'system'; content: string }[] {
	return messages.map((m) => ({
		role: m.role === 'user' ? 'user' : 'system',
		content: m.content,
	}))
}

export function newAiMessageId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
