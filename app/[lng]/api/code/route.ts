import { aiChat, aiErrorResponse } from '@/lib/openrouter'
import { NextResponse } from 'next/server'

const instruction =
	'You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { messages } = body

		if (!messages) {
			return new NextResponse('Messages are required', { status: 400 })
		}

		const text = await aiChat(messages, instruction)
		return NextResponse.json(text)
	} catch (error) {
		return aiErrorResponse(error)
	}
}
