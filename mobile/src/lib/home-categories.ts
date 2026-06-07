import type { CourseDTO, Locale } from '@/types/dto'

const CATEGORY_I18N: Record<string, { en: string; ja: string }> = {
	Programming: { en: 'Programming', ja: 'プログラミング' },
	Language: { en: 'Language', ja: '語学' },
	Math: { en: 'Math', ja: '数学' },
	Science: { en: 'Science', ja: '科学' },
	General: { en: 'General', ja: '一般' },
	'Graphic Design': { en: 'Graphic Design', ja: 'グラフィックデザイン' },
	'User Interface': { en: 'User Interface', ja: 'ユーザーインターフェース' },
	'User Experience': { en: 'User Experience', ja: 'ユーザーエクスペリエンス' },
}

export function getCategoryLabel(key: string, locale: Locale): string {
	const mapped = CATEGORY_I18N[key]
	if (mapped) return locale === 'ja' ? mapped.ja : mapped.en
	return key
}

/** Kurslar ro‘yxatidan noyob kategoriyalar (Home Categories). */
export function getCourseCategories(courses: CourseDTO[] | undefined): string[] {
	if (!courses?.length) return []
	const counts = new Map<string, number>()
	for (const c of courses) {
		const key = c.category?.trim()
		if (!key) continue
		counts.set(key, (counts.get(key) ?? 0) + 1)
	}
	return Array.from(counts.entries())
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([name]) => name)
}

export function filterCoursesByCategory(
	courses: CourseDTO[] | undefined,
	category: string | null,
): CourseDTO[] {
	if (!courses) return []
	if (!category) return courses
	return courses.filter((c) => c.category === category)
}
