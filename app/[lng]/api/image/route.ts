import { NextResponse } from 'next/server'

// Gemini (Generative Language API) bepul kalitida rasm generatsiya qilish mavjud emas
// (Imagen alohida, pullik). Shuning uchun aniq xabar qaytaramiz.
export async function POST() {
	return NextResponse.json(
		{
			message:
				'Image generation is not available on the current AI plan. Use Conversation or Generate Code instead.',
		},
		{ status: 501 }
	)
}
