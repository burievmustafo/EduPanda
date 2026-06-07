import { aiChat, aiErrorResponse } from '@/lib/openrouter'
import { requireUser, handleError, ApiError } from '@/lib/mobile/api'
import { NextResponse } from 'next/server'

const instruction =
	'You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.'

export async function POST(req: Request) {
	try {
		await requireUser(req)
		const body = await req.json().catch(() => ({}))
		const messages = body?.messages
		if (!Array.isArray(messages) || messages.length === 0) {
			throw new ApiError(400, 'invalid_body', 'messages array required')
		}
		const text = await aiChat(messages, instruction)
		return NextResponse.json(text)
	} catch (e) {
		if (e instanceof ApiError) return handleError(e)
		return aiErrorResponse(e)
	}
}
