import type { LessonListItemDTO, SectionDTO } from '@/types/dto'

export function sectionProgressPercent(section: SectionDTO): number {
	if (section.lessons.length === 0) return 0
	const done = section.lessons.filter((l) => l.progress?.isCompleted).length
	return Math.round((done / section.lessons.length) * 100)
}

export function isQuizUnlocked(section: SectionDTO, _enrolled: boolean): boolean {
	return (
		section.lessons.length > 0 &&
		section.lessons.every((l) => l.progress?.isCompleted)
	)
}

export function findUpNextLesson(
	sections: SectionDTO[],
	enrolled: boolean,
): { lesson: LessonListItemDTO; sectionId: string } | null {
	if (!enrolled) return null
	const ordered = [...sections].sort((a, b) => a.position - b.position)
	for (const section of ordered) {
		const lessons = [...section.lessons].sort((a, b) => a.position - b.position)
		for (const lesson of lessons) {
			if (!lesson.progress?.isCompleted) {
				return { lesson, sectionId: section.id }
			}
		}
	}
	return null
}
