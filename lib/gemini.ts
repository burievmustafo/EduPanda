import { AIError } from './openrouter'

// Google Gemini (Generative Language API) — bepul tier.
// Kalit: .env -> GEMINI_API_KEY. Model: GEMINI_MODEL (ixtiyoriy).

type Msg = { role: string; content: string }

const endpoint = (model: string) =>
	`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

export async function geminiChat(
	messages: Msg[],
	systemInstruction?: string
): Promise<string> {
	const key = process.env.GEMINI_API_KEY
	if (!key) {
		throw new AIError(503, 'Gemini is not configured (GEMINI_API_KEY is missing).')
	}
	const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

	// Bizning {role, content} -> Gemini "contents" formati (bot javobi = 'model').
	const contents = messages.map(m => ({
		role: m.role === 'user' ? 'user' : 'model',
		parts: [{ text: m.content }],
	}))

	const body: Record<string, unknown> = { contents }
	if (systemInstruction) {
		body.systemInstruction = { parts: [{ text: systemInstruction }] }
	}

	const res = await fetch(`${endpoint(model)}?key=${key}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	const data = await res.json().catch(() => ({}))

	if (!res.ok) {
		throw new AIError(
			res.status,
			(data as any)?.error?.message || `Gemini request failed (${res.status})`
		)
	}

	const parts = (data as any)?.candidates?.[0]?.content?.parts
	const text = Array.isArray(parts)
		? parts.map((p: any) => p?.text ?? '').join('')
		: ''
	return text.trim() || 'No response.'
}
