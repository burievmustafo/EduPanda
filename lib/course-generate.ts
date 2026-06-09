// Platforma ichidagi "AI Course Builder" uchun: sxema, prompt quruvchilar va
// AI javobini (JSON) mustahkam o'qish. Bepul modellar ham buzuq JSON berishi
// mumkin — shuning uchun kichik chunk'lar + himoyalangan parsing.

import { z } from 'zod'

/* ------------------------------- Turlari -------------------------------- */

export interface DraftQuestion {
	question: string
	options: string[] // 4 ta
	correctIndex: number // 0..3
	explanation?: string
}
export interface DraftLesson {
	title: string
	content: string
}
export interface DraftSection {
	title: string
	lessons: DraftLesson[]
	quiz: DraftQuestion[]
}
export interface CourseDraft {
	title: string
	description: string
	learning: string
	requirements: string
	level: string
	category: string
	language: string
	sections: DraftSection[]
}

export interface GenParams {
	topic: string
	level: string
	category: string
	language: string
	sections: number
	lessonsPerSection: number
	questionsPerSection: number
	notes?: string
}

export interface SectionGenParams {
	courseTitle: string
	level: string
	language: string
	sectionTitle: string
	lessonTitles: string[]
	questionsPerSection: number
}

export interface SectionFill {
	lessons: DraftLesson[]
	quiz: DraftQuestion[]
}

/* ------------------------------- Sxema ---------------------------------- */

export const outlineSchema = z.object({
	title: z.string().min(1),
	description: z.string().default(''),
	learning: z.string().default(''),
	requirements: z.string().default(''),
	sections: z
		.array(
			z.object({
				title: z.string().min(1),
				lessonTitles: z.array(z.string().min(1)).default([]),
			})
		)
		.min(1),
})
export type Outline = z.infer<typeof outlineSchema>

/* --------------------------- Yordamchi funksiyalar ---------------------- */

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, Math.round(Number.isFinite(n) ? n : min)))

export function clampParams(p: GenParams): GenParams {
	return {
		...p,
		sections: clamp(p.sections, 1, 6),
		lessonsPerSection: clamp(p.lessonsPerSection, 1, 5),
		questionsPerSection: clamp(p.questionsPerSection, 0, 10),
	}
}

// AI matnidan JSON ajratib oladi: ```json``` ramka va atrofdagi matnni tashlaydi.
export function extractJson(text: string): any {
	let s = (text || '').trim()
	s = s.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

	const firstBrace = s.indexOf('{')
	const firstBracket = s.indexOf('[')
	const starts = [firstBrace, firstBracket].filter(i => i !== -1)
	if (starts.length === 0) throw new Error('No JSON found')
	const start = Math.min(...starts)

	const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'))
	if (end === -1 || end < start) throw new Error('No JSON found')

	return JSON.parse(s.slice(start, end + 1))
}

// To'g'ri javob indeksini normallaydi: 0..3, "A".."D", 1..4 — hammasini qabul qiladi.
export function normalizeCorrect(raw: unknown): number {
	if (typeof raw === 'number') {
		if (raw >= 0 && raw <= 3) return raw
		if (raw >= 1 && raw <= 4) return raw - 1
		return 0
	}
	const s = String(raw ?? '')
		.toLowerCase()
		.replace(/option/g, '')
		.replace(/[^a-z0-9]/g, '')
	if (!s) return 0
	const ch = s[0]
	if (ch >= 'a' && ch <= 'd') return ch.charCodeAt(0) - 97
	if (ch >= '1' && ch <= '4') return Number(ch) - 1
	return 0
}

// Section to'ldiruvini AI xom JSON'idan tozalab oladi (faqat yaroqli elementlar).
export function normalizeSectionFill(json: any): SectionFill {
	const lessons: DraftLesson[] = Array.isArray(json?.lessons)
		? json.lessons
				.map((l: any) => ({
					title: String(l?.title ?? '').trim(),
					content: String(l?.content ?? '').trim(),
				}))
				.filter((l: DraftLesson) => l.title)
		: []

	const quiz: DraftQuestion[] = Array.isArray(json?.quiz)
		? json.quiz
				.map((q: any) => ({
					question: String(q?.question ?? '').trim(),
					options: Array.isArray(q?.options)
						? q.options.slice(0, 4).map((o: any) => String(o ?? '').trim())
						: [],
					correctIndex: normalizeCorrect(q?.correct),
					explanation: q?.explanation
						? String(q.explanation).trim()
						: undefined,
				}))
				.filter(
					(q: DraftQuestion) =>
						q.question && q.options.length === 4 && q.options.every(Boolean)
				)
		: []

	return { lessons, quiz }
}

// Dars matni student'ga ko'rsatiladi — xavfli HTML'ni olib tashlaymiz (yengil).
export function sanitizeHtml(html: string): string {
	return String(html || '')
		.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
		.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '')
		.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/javascript:/gi, '')
		.trim()
}

/* ----------------------------- Prompt'lar ------------------------------- */

const SYSTEM_JSON =
	'You are an expert curriculum designer. You output ONLY valid JSON. No markdown, no code fences, no comments, and no text before or after the JSON.'

export function buildOutlineMessages(p: GenParams): {
	system: string
	user: string
} {
	const user = `Design an online course outline.
Topic: ${p.topic}
Level: ${p.level}
Category: ${p.category}
Language: write ALL text in ${p.language}.
${p.notes ? `Extra notes from the instructor: ${p.notes}` : ''}

Create EXACTLY ${p.sections} sections. Each section must have EXACTLY ${p.lessonsPerSection} lesson titles.
Lesson titles must be specific to the topic (not generic like "Introduction").

Return JSON with EXACTLY this shape:
{
  "title": "course title",
  "description": "1-2 sentence course description",
  "learning": "short summary of what students will learn",
  "requirements": "prerequisites or 'None'",
  "sections": [
    { "title": "section title", "lessonTitles": ["lesson title 1", "lesson title 2"] }
  ]
}`
	return { system: SYSTEM_JSON, user }
}

export function buildSectionMessages(p: SectionGenParams): {
	system: string
	user: string
} {
	const user = `Write the teaching content for ONE section of a ${p.level} course titled "${p.courseTitle}".
Section title: "${p.sectionTitle}"
Lesson titles (write content for each, in order): ${JSON.stringify(p.lessonTitles)}
Language: write ALL text in ${p.language}.

For each lesson, write concise HTML content of about 150-250 words. Use only <p>, <ul>, <li>, <strong>, <em> tags. Do NOT use <script> or <style>.
Then create ${p.questionsPerSection} multiple-choice quiz questions that test THIS section's actual content (not generic facts).

Return JSON with EXACTLY this shape:
{
  "lessons": [ { "title": "lesson title", "content": "<p>...</p>" } ],
  "quiz": [
    { "question": "...", "options": ["A text","B text","C text","D text"], "correct": "A", "explanation": "why A is correct" }
  ]
}`
	return { system: SYSTEM_JSON, user }
}
