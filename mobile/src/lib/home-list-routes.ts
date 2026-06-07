export type HomeListKind = 'suggestions' | 'top' | 'categories' | 'category'

export function homeListHref(params: {
	list: HomeListKind
	category?: string | null
}): `/home/list?${string}` {
	const search = new URLSearchParams()
	search.set('list', params.list)
	if (params.category) {
		search.set('category', params.category)
	}
	return `/home/list?${search.toString()}`
}
