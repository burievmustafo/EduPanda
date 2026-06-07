import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export default openai

// OpenAI xatolarini tushunarli xabarga aylantiradi (route'lar uchun umumiy).
export function openAIErrorResponse(error: unknown) {
	// Kalit umuman sozlanmagan
	if (!process.env.OPENAI_API_KEY) {
		return NextResponse.json(
			{ message: 'AI is not configured (OPENAI_API_KEY is missing).' },
			{ status: 503 }
		)
	}

	if (error instanceof OpenAI.APIError) {
		const status = error.status ?? 500

		if (status === 429 || error.code === 'insufficient_quota') {
			return NextResponse.json(
				{
					message:
						'AI is temporarily unavailable: OpenAI quota exceeded. Add billing/credits to your OpenAI account.',
				},
				{ status: 429 }
			)
		}
		if (status === 401) {
			return NextResponse.json(
				{ message: 'Invalid OpenAI API key.' },
				{ status: 401 }
			)
		}
		return NextResponse.json(
			{ message: error.message || 'OpenAI request failed.' },
			{ status }
		)
	}

	return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
}
