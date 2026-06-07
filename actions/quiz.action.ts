'use server'

import { connectToDatabase } from '@/lib/mongoose'
import { revalidatePath } from 'next/cache'
import SectionQuiz from '@/database/section-quiz.model'
import QuizQuestion from '@/database/quiz-question.model'
import TimedQuestion from '@/database/timed-question.model'
import TimedQuestionAnswer from '@/database/timed-question-answer.model'
import QuizAttempt from '@/database/quiz-attempt.model'
import UserProgress from '@/database/user-progress.model'
import User from '@/database/user.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'

// Variant id'lari (a/b/c/d). correctOptionId shulardan biriga teng bo'ladi.
const OPTION_IDS = ['a', 'b', 'c', 'd']
const MAX_QUIZ_QUESTIONS = 10

interface IQuestionInput {
	language?: 'en' | 'ja' // instructor tanlaydi (video tiliga mos)
	question: string
	options: string[] // uzunligi 4 — index a/b/c/d ga mos keladi
	correctIndex: number // 0..3
	explanation?: string
}

// Matnni tanlangan til ostida saqlaydi: { en } yoki { ja }.
const buildText = (text: string, lang: 'en' | 'ja' = 'en') =>
	lang === 'ja' ? { ja: text } : { en: text }

// Form qiymatlaridan model uchun option massivini quradi: { id, text:{en|ja} }.
const buildOptions = (options: string[], lang: 'en' | 'ja' = 'en') =>
	options.map((text, i) => ({ id: OPTION_IDS[i], text: buildText(text, lang) }))

/* -------------------------------------------------------------------------- */
/*                           Section oxiridagi test                            */
/* -------------------------------------------------------------------------- */

// Section testi + savollarini olib keladi (instructor ko'rinishi — correctOptionId bilan).
export const getSectionQuiz = async (sectionId: string) => {
	try {
		await connectToDatabase()
		const quiz = await SectionQuiz.findOne({ section: sectionId })
		if (!quiz) return { quiz: null, questions: [] }

		const questions = await QuizQuestion.find({ quiz: quiz._id }).sort({
			order: 1,
		})

		return JSON.parse(JSON.stringify({ quiz, questions }))
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Section uchun test yaratadi (har section'da bitta). Mavjud bo'lsa o'shani qaytaradi.
export const initSectionQuiz = async (sectionId: string, path: string) => {
	try {
		await connectToDatabase()
		let quiz = await SectionQuiz.findOne({ section: sectionId })
		if (!quiz) {
			quiz = await SectionQuiz.create({
				section: sectionId,
				title: { en: 'Final Quiz' },
				passScore: 70,
				isPublished: true,
			})
		}
		revalidatePath(path)
		return JSON.parse(JSON.stringify(quiz))
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Test sozlamasini yangilash (o'tish bali).
export const updateSectionQuiz = async (params: {
	quizId: string
	passScore?: number
	path: string
}) => {
	try {
		await connectToDatabase()
		const { quizId, passScore, path } = params
		const update: Record<string, unknown> = {}
		if (passScore != null) update.passScore = passScore
		await SectionQuiz.findByIdAndUpdate(quizId, update)
		revalidatePath(path)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Testga savol qo'shish (maksimum 10 ta).
export const addQuizQuestion = async (params: {
	quizId: string
	data: IQuestionInput
	path: string
}) => {
	const { quizId, data, path } = params
	try {
		await connectToDatabase()
		const count = await QuizQuestion.countDocuments({ quiz: quizId })
		if (count >= MAX_QUIZ_QUESTIONS) throw new Error('QUIZ_LIMIT')

		const lang = data.language || 'en'
		await QuizQuestion.create({
			quiz: quizId,
			question: buildText(data.question, lang),
			options: buildOptions(data.options, lang),
			correctOptionId: OPTION_IDS[data.correctIndex],
			explanation: data.explanation
				? buildText(data.explanation, lang)
				: undefined,
			order: count + 1,
		})
		revalidatePath(path)
	} catch (error) {
		if (error instanceof Error && error.message === 'QUIZ_LIMIT') {
			throw new Error(`Maximum ${MAX_QUIZ_QUESTIONS} questions allowed`)
		}
		throw new Error('Something went wrong!')
	}
}

// Test savolini o'chirish.
export const deleteQuizQuestion = async (questionId: string, path: string) => {
	try {
		await connectToDatabase()
		await QuizQuestion.findByIdAndDelete(questionId)
		revalidatePath(path)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

/* -------------------------------------------------------------------------- */
/*                    Video ichidagi savol (timed question)                    */
/* -------------------------------------------------------------------------- */

// Darsning timed savolini olib keladi (har darsda bittadan, yo'q bo'lsa null).
export const getTimedQuestion = async (lessonId: string) => {
	try {
		await connectToDatabase()
		const tq = await TimedQuestion.findOne({ lesson: lessonId }).sort({
			order: 1,
		})
		return tq ? JSON.parse(JSON.stringify(tq)) : null
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Darsning timed savolini yaratadi yoki yangilaydi (upsert — har videoda bitta).
export const saveTimedQuestion = async (params: {
	lessonId: string
	triggerTimeSec: number
	data: IQuestionInput
	path: string
}) => {
	try {
		await connectToDatabase()
		const { lessonId, triggerTimeSec, data, path } = params
		const lang = data.language || 'en'

		const payload = {
			lesson: lessonId,
			triggerTimeSec,
			type: 'single_choice',
			question: buildText(data.question, lang),
			options: buildOptions(data.options, lang),
			correctOptionId: OPTION_IDS[data.correctIndex],
			explanation: data.explanation
				? buildText(data.explanation, lang)
				: undefined,
			isPublished: true,
			order: 1,
		}

		const existing = await TimedQuestion.findOne({ lesson: lessonId })
		if (existing) {
			await TimedQuestion.findByIdAndUpdate(existing._id, payload)
		} else {
			await TimedQuestion.create(payload)
		}
		revalidatePath(path)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Darsning timed savolini o'chirish.
export const deleteTimedQuestion = async (lessonId: string, path: string) => {
	try {
		await connectToDatabase()
		await TimedQuestion.deleteMany({ lesson: lessonId })
		revalidatePath(path)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

/* -------------------------------------------------------------------------- */
/*                          STUDENT — o'qish + topshirish                      */
/* -------------------------------------------------------------------------- */

// LocalizedText -> mavjud tilni ko'rsatadi (instructor qaysi tilda kiritgan bo'lsa: en yoki ja).
const txt = (v?: { en?: string; ja?: string }) => v?.en || v?.ja || ''

// Dars uchun timed savol (video ichida chiqadi). correctOptionId YO'Q.
export const getTimedQuestionForStudent = async (lessonId: string) => {
	try {
		await connectToDatabase()
		const tq: any = await TimedQuestion.findOne({
			lesson: lessonId,
			isPublished: true,
		})
			.sort({ order: 1 })
			.lean()
		if (!tq) return null

		return {
			id: String(tq._id),
			triggerTimeSec: tq.triggerTimeSec ?? 0,
			question: txt(tq.question),
			options: (tq.options ?? []).map((o: any) => ({
				id: o.id,
				text: txt(o.text),
			})),
			required: Boolean(tq.required),
		}
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Timed savolga javob — server baholaydi va natijani qaytaradi.
export const answerTimedQuestion = async (params: {
	clerkId: string
	questionId: string
	selectedOptionId?: string
	skipped?: boolean
	videoTimeSec?: number
}) => {
	try {
		await connectToDatabase()
		const {
			clerkId,
			questionId,
			selectedOptionId,
			skipped = false,
			videoTimeSec = 0,
		} = params

		const user = await User.findOne({ clerkId }).select('_id')
		if (!user) throw new Error('User not found')

		const tq: any = await TimedQuestion.findById(questionId).lean()
		if (!tq) throw new Error('Question not found')

		// Baholash FAQAT serverda.
		const isCorrect = !skipped && selectedOptionId === tq.correctOptionId

		await TimedQuestionAnswer.findOneAndUpdate(
			{ student: user._id, question: tq._id },
			{
				student: user._id,
				question: tq._id,
				lesson: tq.lesson,
				selectedOptionId: selectedOptionId || undefined,
				isCorrect,
				skipped,
				videoTimeSec,
				answeredAt: new Date(),
			},
			{ upsert: true }
		)

		return {
			isCorrect,
			correctOptionId: tq.correctOptionId as string,
			explanation: txt(tq.explanation) || undefined,
		}
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Section testi (student ko'rinishi). correctOptionId YO'Q.
export const getSectionQuizForStudent = async (sectionId: string) => {
	try {
		await connectToDatabase()
		const quiz: any = await SectionQuiz.findOne({
			section: sectionId,
			isPublished: true,
		}).lean()
		if (!quiz) return null

		const questions: any[] = await QuizQuestion.find({ quiz: quiz._id })
			.sort({ order: 1 })
			.lean()

		return {
			quizId: String(quiz._id),
			title: txt(quiz.title) || 'Final Quiz',
			passScore: quiz.passScore ?? 70,
			questions: questions.map(q => ({
				id: String(q._id),
				question: txt(q.question),
				options: (q.options ?? []).map((o: any) => ({
					id: o.id,
					text: txt(o.text),
				})),
			})),
		}
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// Section testini topshirish — server baholaydi, natija + review qaytaradi.
export const submitSectionQuiz = async (params: {
	clerkId: string
	quizId: string
	answers: Array<{ questionId: string; selectedOptionId: string }>
}) => {
	try {
		await connectToDatabase()
		const { clerkId, quizId, answers } = params

		const user = await User.findOne({ clerkId }).select('_id')
		if (!user) throw new Error('User not found')

		const quiz: any = await SectionQuiz.findById(quizId).lean()
		if (!quiz) throw new Error('Quiz not found')

		// Gating: section'dagi barcha darslar tugagan bo'lishi shart (web UserProgress).
		const lessons = await Lesson.find({ section: quiz.section })
			.select('_id')
			.lean()
		const lessonIds = lessons.map((l: any) => String(l._id))
		const completed = await UserProgress.countDocuments({
			userId: clerkId,
			lessonId: { $in: lessonIds },
			isCompleted: true,
		})
		if (lessonIds.length > 0 && completed < lessonIds.length) {
			throw new Error('QUIZ_LOCKED')
		}

		const questions: any[] = await QuizQuestion.find({ quiz: quiz._id }).lean()

		// Baholash FAQAT serverda.
		const review = questions.map(q => {
			const given = answers.find(a => a.questionId === String(q._id))
			const selectedOptionId = given?.selectedOptionId || ''
			return {
				questionId: String(q._id),
				selectedOptionId,
				correctOptionId: q.correctOptionId as string,
				isCorrect: selectedOptionId === q.correctOptionId,
				explanation: txt(q.explanation) || undefined,
			}
		})

		const correctAnswers = review.filter(r => r.isCorrect).length
		const totalQuestions = questions.length
		const score =
			totalQuestions > 0
				? Math.round((correctAnswers / totalQuestions) * 100)
				: 0
		const passed = score >= (quiz.passScore ?? 70)

		await QuizAttempt.create({
			student: user._id,
			quiz: quiz._id,
			section: quiz.section,
			answers: review.map(r => ({
				question: r.questionId,
				selectedOptionId: r.selectedOptionId,
				isCorrect: r.isCorrect,
			})),
			totalQuestions,
			correctAnswers,
			score,
			passed,
			startedAt: new Date(),
			submittedAt: new Date(),
		})

		return { totalQuestions, correctAnswers, score, passed, review }
	} catch (error) {
		if (error instanceof Error && error.message === 'QUIZ_LOCKED') {
			throw new Error('Complete all section lessons before taking the quiz')
		}
		throw new Error('Something went wrong!')
	}
}

// Kursdagi qaysi section'larda test borligini qaytaradi (sidebar uchun).
export const getQuizSectionIds = async (courseId: string) => {
	try {
		await connectToDatabase()
		const sections = await Section.find({ course: courseId })
			.select('_id')
			.lean()
		const sectionIds = sections.map((s: any) => s._id)
		const quizzes = await SectionQuiz.find({
			section: { $in: sectionIds },
			isPublished: true,
		})
			.select('section')
			.lean()
		return quizzes.map((q: any) => String(q.section))
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}
