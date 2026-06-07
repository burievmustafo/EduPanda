import { apiPost } from '@/api/client'

export type AiChatMessagePayload = {
	role: 'user' | 'system'
	content: string
}

export const postAiConversation = (messages: AiChatMessagePayload[]) =>
	apiPost<string>('/ai/conversation', { messages })

export const postAiCode = (messages: AiChatMessagePayload[]) =>
	apiPost<string>('/ai/code', { messages })
