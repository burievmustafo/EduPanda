export const fallbackLng = 'en'
export const languages = [fallbackLng, 'ja']
export const cookieName = 'i18next'

export function getOptions(lng = fallbackLng) {
	return {
		supportedLngs: languages,
		fallbackLng,
		lng,
	}
}
