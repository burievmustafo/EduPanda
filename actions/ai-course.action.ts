'use server'

import { aiComplete, isRateLimited } from '@/lib/ai'
import {
	buildOutlineMessages,
	buildSectionMessages,
	clampParams,
	extractJson,
	normalizeSectionFill,
	outlineSchema,
	sanitizeHtml,
	type CourseDraft,
	type GenParams,
	type Outline,
	type SectionFill,
	type SectionGenParams,
} from '@/lib/course-generate'
import { connectToDatabase } from '@/lib/mongoose'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizQuestion from '@/database/quiz-question.model'
import User from '@/database/user.model'
import { revalidatePath } from 'next/cache'

const OPTION_IDS = ['a', 'b', 'c', 'd']
const PLACEHOLDER_IMAGE = '/assets/hero.png'

// AI javobini oladi; buzuq bo'lsa bir marta qayta urinadi.
async function aiJson(system: string, user: string): Promise<any> {
	// Provayder xatosi (429/401...) shu yerda otiladi — qayta urinmaymiz.
	const raw = await aiComplete([{ role: 'user', content: user }], system)
	try {
		return extractJson(raw)
	} catch {
		// Faqat JSON parse buzilsa — bir marta "faqat JSON" deb qayta so'raymiz.
		const retry = await aiComplete(
			[{ role: 'user', content: user + '\n\nReturn ONLY valid JSON, nothing else.' }],
			system
		)
		return extractJson(retry)
	}
}

/* -------------------------------------------------------------------------- */
/*                       1-bosqich: kurs outline (skelet)                      */
/* -------------------------------------------------------------------------- */

export async function generateCourseOutline(
	params: GenParams
): Promise<Outline> {
	const p = clampParams(params)
	const { system, user } = buildOutlineMessages(p)

	try {
		const json = await aiJson(system, user)
		const parsed = outlineSchema.parse(json)

		// So'ralgan o'lchamga qisqartiramiz
		parsed.sections = parsed.sections.slice(0, p.sections).map(s => ({
			...s,
			lessonTitles: s.lessonTitles.slice(0, p.lessonsPerSection),
		}))
		return parsed
	} catch (error) {
		if (isRateLimited(error)) throw new Error('AI_BUSY')
		throw new Error('AI_FAILED')
	}
}

/* -------------------------------------------------------------------------- */
/*                  2-bosqich: bitta section uchun matn + test                 */
/* -------------------------------------------------------------------------- */

export async function generateSectionContent(
	params: SectionGenParams
): Promise<SectionFill> {
	const { system, user } = buildSectionMessages(params)

	try {
		const json = await aiJson(system, user)
		return normalizeSectionFill(json)
	} catch (error) {
		if (isRateLimited(error)) throw new Error('AI_BUSY')
		// JSON parse xatosi — bo'sh qaytaramiz, teacher keyin to'ldiradi
		return { lessons: [], quiz: [] }
	}
}

/* -------------------------------------------------------------------------- */
/*                  Draft'ni bazaga yozish (Draft, published:false)           */
/* -------------------------------------------------------------------------- */

export async function createCourseFromDraft(
	draft: CourseDraft,
	clerkId: string
): Promise<{ courseId: string }> {
	try {
		await connectToDatabase()
		const user = await User.findOne({ clerkId })
		if (!user) throw new Error('User not found')

		const slot: 'en' | 'ja' = draft.language === 'japanese' ? 'ja' : 'en'

		const course = await Course.create({
			title: draft.title,
			titleI18n: { [slot]: draft.title },
			description: draft.description,
			descriptionI18n: { [slot]: draft.description },
			learning: draft.learning,
			requirements: draft.requirements,
			level: draft.level,
			category: draft.category,
			language: draft.language,
			oldPrice: 0,
			currentPrice: 0,
			previewImage: PLACEHOLDER_IMAGE,
			published: false,
			instructor: user._id,
		})

		let sPos = 1
		for (const section of draft.sections) {
			const sec = await Section.create({
				title: section.title,
				titleI18n: { [slot]: section.title },
				course: course._id,
				position: sPos++,
				lessons: [],
			})

			let lPos = 0
			for (const lesson of section.lessons) {
				const content = sanitizeHtml(lesson.content)
				const created = await Lesson.create({
					title: lesson.title,
					titleI18n: { [slot]: lesson.title },
					content,
					contentI18n: { [slot]: content },
					position: lPos++,
					duration: { hours: 0, minutes: 0, seconds: 0 },
					section: sec._id,
					free: false,
				})
				sec.lessons.push(created._id)
			}
			await sec.save()

			if (section.quiz && section.quiz.length) {
				const quiz = await SectionQuiz.create({
					section: sec._id,
					title: { en: 'Final Quiz' },
					passScore: 70,
					isPublished: true,
				})
				let order = 0
				for (const q of section.quiz.slice(0, 10)) {
					await QuizQuestion.create({
						quiz: quiz._id,
						question: { [slot]: q.question },
						options: q.options.map((text, i) => ({
							id: OPTION_IDS[i],
							text: { [slot]: text },
						})),
						correctOptionId: OPTION_IDS[q.correctIndex] ?? 'a',
						explanation: q.explanation ? { [slot]: q.explanation } : undefined,
						order: ++order,
					})
				}
			}
		}

		revalidatePath('/en/instructor/my-courses')
		return { courseId: String(course._id) }
	} catch (error) {
		throw new Error('Something went wrong while creating the course!')
	}
}
