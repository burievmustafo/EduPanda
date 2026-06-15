import { z } from 'zod'
import { sanitizeHtml } from '@/lib/course-generate'

export const COURSE_PACKAGE_TYPE = 'edupanda-course'
export const COURSE_PACKAGE_VERSION = 1

export const localizedTextSchema = z
	.object({
		en: z.string().optional(),
		ja: z.string().optional(),
	})
	.default({})

export const coursePackageSchema = z.object({
	version: z.literal(COURSE_PACKAGE_VERSION),
	type: z.literal(COURSE_PACKAGE_TYPE),
	exportedAt: z.string().optional(),
	course: z.object({
		title: z.string().min(1),
		description: z.string().default(''),
		learning: z.string().default(''),
		requirements: z.string().default(''),
		titleI18n: localizedTextSchema.optional(),
		descriptionI18n: localizedTextSchema.optional(),
		learningI18n: localizedTextSchema.optional(),
		requirementsI18n: localizedTextSchema.optional(),
		level: z.string().default('beginner'),
		category: z.string().default('General'),
		language: z.string().default('english'),
		oldPrice: z.coerce.number().nonnegative().default(0),
		currentPrice: z.coerce.number().nonnegative().default(0),
		previewImage: z.string().default('/assets/hero.png'),
		slug: z.string().optional(),
		tags: z.string().optional(),
		resources: z
			.array(
				z.object({
					title: z.string().min(1),
					url: z.string().min(1),
					type: z.enum(['link', 'file']).default('link'),
				})
			)
			.default([]),
	}),
	sections: z
		.array(
			z.object({
				title: z.string().min(1),
				titleI18n: localizedTextSchema.optional(),
				position: z.coerce.number().int().nonnegative().optional(),
				lessons: z
					.array(
						z.object({
							title: z.string().min(1),
							titleI18n: localizedTextSchema.optional(),
							content: z.string().default(''),
							contentI18n: localizedTextSchema.optional(),
							videoUrl: z.string().optional().default(''),
							durationSec: z.coerce.number().int().nonnegative().default(0),
							duration: z
								.object({
									hours: z.coerce.number().int().nonnegative().default(0),
									minutes: z.coerce.number().int().nonnegative().default(0),
									seconds: z.coerce.number().int().nonnegative().default(0),
								})
								.default({ hours: 0, minutes: 0, seconds: 0 }),
							free: z.boolean().default(false),
							position: z.coerce.number().int().nonnegative().optional(),
						})
					)
					.default([]),
				quiz: z
					.object({
						title: localizedTextSchema.optional(),
						passScore: z.coerce.number().min(0).max(100).default(70),
						timeLimitMin: z.coerce.number().int().positive().optional(),
						isPublished: z.boolean().default(true),
						questions: z
							.array(
								z.object({
									question: localizedTextSchema,
									options: z
										.array(
											z.object({
												id: z.string().min(1),
												text: localizedTextSchema,
											})
										)
										.min(2)
										.max(4),
									correctOptionId: z.string().min(1),
									explanation: localizedTextSchema.optional(),
									order: z.coerce.number().int().positive().optional(),
								})
							)
							.max(10)
							.default([]),
					})
					.optional(),
			})
		)
		.default([]),
})

export type CoursePackage = z.infer<typeof coursePackageSchema>

const pickText = (value?: { en?: string; ja?: string } | null) =>
	value?.en || value?.ja || ''

const cleanLocalized = (value?: { en?: string; ja?: string } | null) => ({
	...(value?.en ? { en: value.en.trim() } : {}),
	...(value?.ja ? { ja: value.ja.trim() } : {}),
})

export function parseCoursePackage(input: unknown): CoursePackage {
	const parsed = coursePackageSchema.parse(input)

	return {
		...parsed,
		course: {
			...parsed.course,
			title: parsed.course.title.trim(),
			description: parsed.course.description.trim(),
			learning: parsed.course.learning.trim(),
			requirements: parsed.course.requirements.trim(),
			titleI18n: cleanLocalized(parsed.course.titleI18n),
			descriptionI18n: cleanLocalized(parsed.course.descriptionI18n),
			learningI18n: cleanLocalized(parsed.course.learningI18n),
			requirementsI18n: cleanLocalized(parsed.course.requirementsI18n),
			resources: parsed.course.resources.map(resource => ({
				...resource,
				title: resource.title.trim(),
				url: resource.url.trim(),
			})),
		},
		sections: parsed.sections.map((section, sectionIndex) => ({
			...section,
			title: section.title.trim(),
			titleI18n: cleanLocalized(section.titleI18n),
			position: section.position ?? sectionIndex,
			lessons: section.lessons.map((lesson, lessonIndex) => {
				const content = sanitizeHtml(lesson.content)
				return {
					...lesson,
					title: lesson.title.trim(),
					titleI18n: cleanLocalized(lesson.titleI18n),
					content,
					contentI18n: cleanLocalized(lesson.contentI18n),
					position: lesson.position ?? lessonIndex,
				}
			}),
			quiz: section.quiz
				? {
						...section.quiz,
						title: cleanLocalized(section.quiz.title),
						questions: section.quiz.questions.map((question, index) => ({
							...question,
							question: cleanLocalized(question.question),
							options: question.options.map(option => ({
								id: option.id,
								text: cleanLocalized(option.text),
							})),
							explanation: cleanLocalized(question.explanation),
							order: question.order ?? index + 1,
						})),
					}
				: undefined,
		})),
	}
}

export function getCoursePackageStats(pkg: CoursePackage) {
	const lessons = pkg.sections.reduce(
		(total, section) => total + section.lessons.length,
		0
	)
	const questions = pkg.sections.reduce(
		(total, section) => total + (section.quiz?.questions.length ?? 0),
		0
	)

	return {
		sections: pkg.sections.length,
		lessons,
		questions,
	}
}

export function getPackageText(value?: { en?: string; ja?: string } | null) {
	return pickText(value)
}
