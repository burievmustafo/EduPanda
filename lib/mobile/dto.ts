// Mongoose hujjatlardan mobil DTO'larga aylantirish (DATABASE_AND_API_PLAN.md §4).
// ⚠️ correctOptionId / explanation savol DTO'lariga KIRMAYDI.

type L = { en?: string; ja?: string } | undefined

/** i18n maydonni afzal ko'radi, bo'sh bo'lsa oddiy String'ga fallback. */
export function li18n(i18n: L, plain?: string): { en: string; ja?: string } {
	const en = i18n?.en && i18n.en.trim() ? i18n.en : plain ?? ''
	const ja = i18n?.ja && i18n.ja.trim() ? i18n.ja : undefined
	return ja ? { en, ja } : { en }
}

export function lessonDurationSec(lesson: any): number {
	if (lesson?.durationSec && lesson.durationSec > 0) return lesson.durationSec
	const d = lesson?.duration
	if (d) return (d.hours || 0) * 3600 + (d.minutes || 0) * 60 + (d.seconds || 0)
	return 0
}

export function toCourseDTO(
	course: any,
	extra: { sectionsCount: number; lessonsCount: number; isEnrolled: boolean }
) {
	return {
		id: String(course._id),
		title: li18n(course.titleI18n, course.title),
		description: li18n(course.descriptionI18n, course.description),
		previewImage: course.previewImage || undefined,
		level: course.level || '',
		category: course.category || '',
		instructor: {
			id: String(course.instructor?._id || course.instructor || ''),
			fullName: course.instructor?.fullName || '',
			picture: course.instructor?.picture || undefined,
		},
		sectionsCount: extra.sectionsCount,
		lessonsCount: extra.lessonsCount,
		isEnrolled: extra.isEnrolled,
	}
}

export function toLessonListItem(lesson: any, progress?: any) {
	return {
		id: String(lesson._id),
		title: li18n(lesson.titleI18n, lesson.title),
		position: lesson.position || 0,
		durationSec: lessonDurationSec(lesson),
		free: Boolean(lesson.free),
		progress: progress
			? {
					watchedPercent: progress.watchedPercent || 0,
					isCompleted: Boolean(progress.isCompleted),
			  }
			: undefined,
	}
}

export function toSectionDTO(section: any, lessons: any[], hasQuiz: boolean) {
	return {
		id: String(section._id),
		title: li18n(section.titleI18n, section.title),
		position: section.position || 0,
		lessons,
		hasQuiz,
	}
}

/** correctOptionId / explanation YO'Q. */
export function toTimedQuestionDTO(tq: any) {
	return {
		id: String(tq._id),
		triggerTimeSec: tq.triggerTimeSec || 0,
		type: 'single_choice' as const,
		question: li18n(tq.question),
		options: (tq.options || []).map((o: any) => ({
			id: o.id,
			text: li18n(o.text),
		})),
		required: Boolean(tq.required),
	}
}

export function toLessonDetailDTO(
	lesson: any,
	timedQuestions: any[],
	progress?: any,
	answeredQuestionIds: string[] = []
) {
	return {
		id: String(lesson._id),
		sectionId: String(lesson.section),
		courseId: String(lesson.courseId || ''),
		title: li18n(lesson.titleI18n, lesson.title),
		content: li18n(lesson.contentI18n, lesson.content),
		videoUrl: lesson.videoUrl || '',
		durationSec: lessonDurationSec(lesson),
		free: Boolean(lesson.free),
		timedQuestions: timedQuestions
			.sort((a, b) => (a.order || 0) - (b.order || 0))
			.map(toTimedQuestionDTO),
		answeredQuestionIds,
		progress: progress
			? {
					lastPositionSec: progress.lastPositionSec || 0,
					watchedPercent: progress.watchedPercent || 0,
					isCompleted: Boolean(progress.isCompleted),
			  }
			: undefined,
	}
}

/** correctOptionId YO'Q. */
export function toQuizDTO(quiz: any, questions: any[]) {
	return {
		id: String(quiz._id),
		sectionId: String(quiz.section),
		title: li18n(quiz.title),
		passScore: quiz.passScore ?? 70,
		timeLimitMin: quiz.timeLimitMin || undefined,
		questions: questions
			.sort((a, b) => (a.order || 0) - (b.order || 0))
			.map((q) => ({
				id: String(q._id),
				question: li18n(q.question),
				options: (q.options || []).map((o: any) => ({
					id: o.id,
					text: li18n(o.text),
				})),
				order: q.order || 0,
			})),
	}
}
