import { authMiddleware } from '@clerk/nextjs'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
	locales: ['en', 'ja'],
	defaultLocale: 'en',
})

export default authMiddleware({
	// Dev: kompyuter soati Clerk serveridan biroz orqada bo'lsa JWT "kelajakda" deb rad etiladi.
	clockSkewInMs: 60_000,
	beforeAuth: req => intlMiddleware(req),
	publicRoutes: [
		'/:lng',
		'/:lng/courses',
		'/:lng/course/:slug',
		'/:lng/blogs',
		'/:lng/blogs/:slug',
		'/:lng/contacts',
		'/:lng/instructors',
		'/:lng/instructors/:instructorId',
		'/:lng/shopping/cart',
		'/:lng/sign-in',
		'/:lng/sign-up',
		'/:lng/ai',
		// Mobil API: Clerk bloklamasin (auth qo'lda — Bearer token route ichida tekshiriladi)
		'/(.*)/api/mobile(.*)',
		'/api/mobile(.*)',
		// EduPanda web: kurslar va o'quv sahifalar
		'/:lng/edupanda',
		'/:lng/edupanda/courses',
		'/:lng/edupanda/course/:id',
	],
	ignoredRoutes: ['/en/api/webhook', '/(.*)/api/mobile(.*)', '/api/mobile(.*)'],
})

export const config = {
	matcher: [
		'/((?![^/]+/api/mobile|.+\\.[\\w]+$|_next).*)',
		'/',
		'/(api|trpc)(.*)',
	],
}
