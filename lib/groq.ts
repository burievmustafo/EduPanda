import { AIError } from './openrouter'

// Groq — juda tez, saxiy bepul tier (OpenAI-mos API).
// Kalit: .env -> GROQ_API_KEY. Model: GROQ_MODEL (ixtiyoriy).

const BASE = 'https://api.groq.com/openai/v1/chat/completions'

// Bepul modellar — biri band (429) yoki yo'q (404) bo'lsa keyingisiga o'tadi.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']

type Msg = { role: string; content: string }

const normalize = (m: Msg) => ({
	role: m.role === 'user' ? 'user' : 'assistant',
	content: m.content,
})

export async function groqChat(
	messages: Msg[],
	systemInstruction?: string
): Promise<string> {
	const key = process.env.GROQ_API_KEY
	if (!key) {
		throw new AIError(503, 'Groq is not configured (GROQ_API_KEY is missing).')
	}

	const finalMessages = systemInstruction
		? [{ role: 'system', content: systemInstruction }, ...messages.map(normalize)]
		: messages.map(normalize)

	const envModel = process.env.GROQ_MODEL
	const models = envModel
		? [envModel, ...GROQ_MODELS.filter(m => m !== envModel)]
		: GROQ_MODELS

	const retryable = new Set([429, 404, 502, 503])
	let lastErr: AIError | null = null

	for (const model of models) {
		const res = await fetch(BASE, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + key,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ model, messages: finalMessages }),
		})
		const data = await res.json().catch(() => ({}))

		if (res.ok) {
			return (data?.choices?.[0]?.message?.content ?? '').trim() || 'No response.'
		}

		lastErr = new AIError(
			res.status,
			(data as any)?.error?.message || `Groq request failed (${res.status})`
		)
		if (!retryable.has(res.status)) throw lastErr
	}

	throw lastErr ?? new AIError(500, 'Groq request failed')
}
