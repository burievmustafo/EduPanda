import { NextResponse } from 'next/server'

// OpenRouter (OpenAI-mos API) — bepul modellar bilan.
// Kalit: .env -> OPENROUTER_API_KEY. Model: OPENROUTER_MODEL (ixtiyoriy).
const BASE = 'https://openrouter.ai/api/v1/chat/completions'

// Bepul modellar — biri rate-limit (429) bo'lsa keyingisiga o'tadi.
const FREE_MODELS = [
	'google/gemma-4-31b-it:free',
	'meta-llama/llama-3.3-70b-instruct:free',
	'qwen/qwen3-next-80b-a3b-instruct:free',
	'google/gemma-4-26b-a4b-it:free',
]

export class AIError extends Error {
	status: number
	constructor(status: number, message: string) {
		super(message)
		this.status = status
		this.name = 'AIError'
	}
}

type Msg = { role: string; content: string }

// Mijoz tarixida bot javoblari 'system' deb belgilangan — OpenAI formatida ular 'assistant'.
function normalize(m: Msg) {
	return { role: m.role === 'user' ? 'user' : 'assistant', content: m.content }
}

export async function aiChat(
	messages: Msg[],
	systemInstruction?: string
): Promise<string> {
	const key = process.env.OPENROUTER_API_KEY
	if (!key) {
		throw new AIError(503, 'AI is not configured (OPENROUTER_API_KEY is missing).')
	}

	const finalMessages = systemInstruction
		? [{ role: 'system', content: systemInstruction }, ...messages.map(normalize)]
		: messages.map(normalize)

	const envModel = process.env.OPENROUTER_MODEL
	const models = envModel
		? [envModel, ...FREE_MODELS.filter(m => m !== envModel)]
		: FREE_MODELS

	let lastErr: AIError | null = null
	// Rate-limit / model yo'q bo'lsa — keyingi bepul modelni sinaymiz.
	const retryable = new Set([429, 404, 502, 503])

	for (const model of models) {
		const res = await fetch(BASE, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + key,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://edupanda.app',
				'X-Title': 'EduPanda',
			},
			body: JSON.stringify({ model, messages: finalMessages }),
		})
		const data = await res.json().catch(() => ({}))

		if (res.ok) {
			return (data?.choices?.[0]?.message?.content ?? '').trim() || 'No response.'
		}

		lastErr = new AIError(
			res.status,
			(data as any)?.error?.message || `AI request failed (${res.status})`
		)
		if (!retryable.has(res.status)) throw lastErr // 401/400 -> to'xtaymiz
	}

	throw lastErr ?? new AIError(500, 'AI request failed')
}

export function aiErrorResponse(error: unknown) {
	if (error instanceof AIError) {
		if (error.status === 429) {
			return NextResponse.json(
				{
					message:
						'AI is busy (free-model rate limit). Please try again in a few seconds.',
				},
				{ status: 429 }
			)
		}
		if (error.status === 401) {
			return NextResponse.json(
				{ message: 'Invalid OpenRouter API key.' },
				{ status: 401 }
			)
		}
		return NextResponse.json(
			{ message: error.message },
			{ status: error.status || 500 }
		)
	}
	return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
}
