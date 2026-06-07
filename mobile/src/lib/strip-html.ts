/** CMS/HTML matnini mobil ko‘rinish uchun oddiy matnga aylantiradi. */
export function stripHtml(html: string): string {
	if (!html) return ''

	const withBreaks = html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n')
		.replace(/<\/div>/gi, '\n')
		.replace(/<\/li>/gi, '\n')

	const text = withBreaks
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\n{3,}/g, '\n\n')

	return text.trim()
}
