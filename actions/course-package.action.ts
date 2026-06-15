'use server'

import Course from '@/database/course.model'
import Lesson from '@/database/lesson.model'
import QuizQuestion from '@/database/quiz-question.model'
import Section from '@/database/section.model'
import SectionQuiz from '@/database/section-quiz.model'
import User from '@/database/user.model'
import {
	COURSE_PACKAGE_TYPE,
	COURSE_PACKAGE_VERSION,
	type CoursePackage,
	getPackageText,
	parseCoursePackage,
} from '@/lib/course-package'
import { connectToDatabase } from '@/lib/mongoose'
import { revalidatePath } from 'next/cache'

const PLACEHOLDER_IMAGE = '/assets/hero.png'

async function getInstructor(clerkId: string) {
	const user = await User.findOne({ clerkId }).select('_id')
	if (!user) throw new Error('User not found')
	return user
}

async function assertCourseOwner(courseId: string, clerkId: string) {
	const user = await getInstructor(clerkId)
	const course = await Course.findById(courseId).lean()

	if (!course) throw new Error('Course not found')
	if (String((course as any).instructor) !== String(user._id)) {
		throw new Error('You are not allowed to export this course')
	}

	return { user, course: course as any }
}

export async function exportCoursePackage(
	courseId: string,
	clerkId: string
): Promise<CoursePackage> {
	try {
		await connectToDatabase()
		const { course } = await assertCourseOwner(courseId, clerkId)

		const sections = await Section.find({ course: course._id })
			.sort({ position: 1 })
			.lean()

		const packagedSections = []
		for (const section of sections as any[]) {
			const lessons = await Lesson.find({ section: section._id })
				.sort({ position: 1 })
				.lean()
			const quiz = await SectionQuiz.findOne({ section: section._id }).lean()
			const questions = quiz
				? await QuizQuestion.find({ quiz: (quiz as any)._id })
						.sort({ order: 1 })
						.lean()
				: []

			packagedSections.push({
				title: section.title || getPackageText(section.titleI18n),
				titleI18n: section.titleI18n || {},
				position: section.position ?? packagedSections.length,
				lessons: (lessons as any[]).map((lesson, index) => ({
					title: lesson.title || getPackageText(lesson.titleI18n),
					titleI18n: lesson.titleI18n || {},
					content: lesson.content || getPackageText(lesson.contentI18n),
					contentI18n: lesson.contentI18n || {},
					videoUrl: lesson.videoUrl || '',
					durationSec: lesson.durationSec || 0,
					duration: {
						hours: lesson.duration?.hours || 0,
						minutes: lesson.duration?.minutes || 0,
						seconds: lesson.duration?.seconds || 0,
					},
					free: Boolean(lesson.free),
					position: lesson.position ?? index,
				})),
				quiz: quiz
					? {
							title: (quiz as any).title || { en: 'Final Quiz' },
							passScore: (quiz as any).passScore ?? 70,
							timeLimitMin: (quiz as any).timeLimitMin || undefined,
							isPublished: Boolean((quiz as any).isPublished ?? true),
							questions: (questions as any[]).slice(0, 10).map((question, index) => ({
								question: question.question || {},
								options: (question.options || []).slice(0, 4).map((option: any) => ({
									id: option.id,
									text: option.text || {},
								})),
								correctOptionId: question.correctOptionId || 'a',
								explanation: question.explanation || {},
								order: question.order ?? index + 1,
							})),
						}
					: undefined,
			})
		}

		return parseCoursePackage({
			version: COURSE_PACKAGE_VERSION,
			type: COURSE_PACKAGE_TYPE,
			exportedAt: new Date().toISOString(),
			course: {
				title: course.title || getPackageText(course.titleI18n),
				description:
					course.description || getPackageText(course.descriptionI18n),
				learning: course.learning || getPackageText(course.learningI18n),
				requirements:
					course.requirements || getPackageText(course.requirementsI18n),
				titleI18n: course.titleI18n || {},
				descriptionI18n: course.descriptionI18n || {},
				learningI18n: course.learningI18n || {},
				requirementsI18n: course.requirementsI18n || {},
				level: course.level || 'beginner',
				category: course.category || 'General',
				language: course.language || 'english',
				oldPrice: course.oldPrice || 0,
				currentPrice: course.currentPrice || 0,
				previewImage: course.previewImage || PLACEHOLDER_IMAGE,
				slug: course.slug || undefined,
				tags: course.tags || undefined,
				resources: course.resources || [],
			},
			sections: packagedSections,
		})
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error('Something went wrong while exporting course!')
	}
}

export async function importCoursePackage(
	rawPackage: unknown,
	clerkId: string
): Promise<{ courseId: string }> {
	try {
		await connectToDatabase()
		const user = await getInstructor(clerkId)
		const pkg = parseCoursePackage(rawPackage)

		const course = await Course.create({
			title: pkg.course.title,
			description: pkg.course.description,
			learning: pkg.course.learning,
			requirements: pkg.course.requirements,
			titleI18n: pkg.course.titleI18n,
			descriptionI18n: pkg.course.descriptionI18n,
			learningI18n: pkg.course.learningI18n,
			requirementsI18n: pkg.course.requirementsI18n,
			level: pkg.course.level,
			category: pkg.course.category,
			language: pkg.course.language,
			oldPrice: pkg.course.oldPrice,
			currentPrice: pkg.course.currentPrice,
			previewImage: pkg.course.previewImage || PLACEHOLDER_IMAGE,
			tags: pkg.course.tags,
			resources: pkg.course.resources,
			published: false,
			instructor: user._id,
		})

		for (let sectionIndex = 0; sectionIndex < pkg.sections.length; sectionIndex++) {
			const sectionInput = pkg.sections[sectionIndex]
			const section = await Section.create({
				title: sectionInput.title,
				titleI18n: sectionInput.titleI18n,
				course: course._id,
				position: sectionInput.position ?? sectionIndex,
				lessons: [],
			})

			for (
				let lessonIndex = 0;
				lessonIndex < sectionInput.lessons.length;
				lessonIndex++
			) {
				const lessonInput = sectionInput.lessons[lessonIndex]
				const lesson = await Lesson.create({
					title: lessonInput.title,
					titleI18n: lessonInput.titleI18n,
					content: lessonInput.content,
					contentI18n: lessonInput.contentI18n,
					videoUrl: lessonInput.videoUrl,
					durationSec: lessonInput.durationSec,
					duration: lessonInput.duration,
					free: lessonInput.free,
					position: lessonInput.position ?? lessonIndex,
					section: section._id,
				})
				section.lessons.push(lesson._id)
			}
			await section.save()

			if (sectionInput.quiz && sectionInput.quiz.questions.length > 0) {
				const quiz = await SectionQuiz.create({
					section: section._id,
					title: sectionInput.quiz.title || { en: 'Final Quiz' },
					passScore: sectionInput.quiz.passScore,
					timeLimitMin: sectionInput.quiz.timeLimitMin,
					isPublished: sectionInput.quiz.isPublished,
				})

				await QuizQuestion.insertMany(
					sectionInput.quiz.questions.map((question: any, index: number) => ({
						quiz: quiz._id,
						question: question.question,
						options: question.options,
						correctOptionId: question.correctOptionId,
						explanation: question.explanation,
						order: question.order ?? index + 1,
					}))
				)
			}
		}

		revalidatePath('/en/instructor/my-courses')
		return { courseId: String(course._id) }
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error('Something went wrong while importing course!')
	}
}
