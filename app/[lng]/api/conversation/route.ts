import { aiChat, aiErrorResponse } from '@/lib/openrouter'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { messages } = body

		if (!messages) {
			return new NextResponse('Messages are required', { status: 400 })
		}

		const text = await aiChat(messages)
		return NextResponse.json(text)
	} catch (error) {
		return aiErrorResponse(error)
	}
}
