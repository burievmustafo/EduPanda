import type { LessonDetailDTO, LessonListItemDTO, SectionDTO } from '@/types/dto'

export function getLearningFlow(
	sections: SectionDTO[] | undefined,
	lesson: LessonDetailDTO,
	watchedPercent: number,
) {
	const allLessons: LessonListItemDTO[] = sections?.flatMap((section) => section.lessons) ?? []
	const totalLessons = allLessons.length || 1
	const completedLessons = allLessons.filter((item) =>
		item.id === lesson.id
			? watchedPercent >= 90 || Boolean(item.progress?.isCompleted)
			: Boolean(item.progress?.isCompleted),
	).length
	const currentSection = sections?.find((section) => section.id === lesson.sectionId)
	const sectionLessons = currentSection?.lessons ?? []
	const currentIndex = sectionLessons.findIndex((item) => item.id === lesson.id)
	const nextLesson = currentIndex >= 0 ? sectionLessons[currentIndex + 1] : undefined
	const quizUnlocked = sectionLessons.length
		? sectionLessons.every((item) =>
				item.id === lesson.id
					? watchedPercent >= 90 || Boolean(item.progress?.isCompleted)
					: Boolean(item.progress?.isCompleted),
			)
		: watchedPercent >= 90
	const nextItem = nextLesson
		? { type: 'lesson' as const, id: nextLesson.id }
		: currentSection?.hasQuiz
			? { type: 'quiz' as const, id: currentSection.id }
			: undefined

	return {
		totalItems: totalLessons + (sections?.filter((section) => section.hasQuiz).length ?? 0),
		completedItems: completedLessons,
		quizUnlocked,
		nextItem,
		sectionTitle: currentSection?.title,
	}
}
