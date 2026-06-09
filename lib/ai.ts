import { aiChat, AIError } from './openrouter'
import { geminiChat } from './gemini'
import { groqChat } from './groq'

// Bir nechta provayderni navbat bilan sinaydi: biri band/ishlamasa (429, 401, 404...)
// keyingisiga o'tadi. Maqsad — bepul tier'larda imkon qadar ishonchli bo'lish.

type Msg = { role: string; content: string }

export async function aiComplete(
	messages: Msg[],
	systemInstruction?: string
): Promise<string> {
	const providers: Array<{ name: string; run: () => Promise<string> }> = []

	// Groq birinchi — eng tez va saxiy bepul tier.
	if (process.env.GROQ_API_KEY) {
		providers.push({
			name: 'groq',
			run: () => groqChat(messages, systemInstruction),
		})
	}
	if (process.env.OPENROUTER_API_KEY) {
		providers.push({
			name: 'openrouter',
			run: () => aiChat(messages, systemInstruction),
		})
	}
	if (process.env.GEMINI_API_KEY) {
		providers.push({
			name: 'gemini',
			run: () => geminiChat(messages, systemInstruction),
		})
	}

	if (providers.length === 0) {
		throw new AIError(
			503,
			'AI is not configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY.'
		)
	}

	let lastErr: unknown
	for (const p of providers) {
		try {
			return await p.run()
		} catch (err) {
			lastErr = err
			// Har qanday xatoda keyingi provayderni sinaymiz (kalitlar har xil).
		}
	}
	throw lastErr ?? new AIError(500, 'AI request failed')
}

// Xato rate-limit (band) tufaylimi? — foydalanuvchiga "keyinroq urinib ko'ring" deyish uchun.
export function isRateLimited(err: unknown): boolean {
	return err instanceof AIError && (err.status === 429 || err.status === 402)
}
