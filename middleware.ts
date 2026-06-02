import { authMiddleware } from '@clerk/nextjs'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
	locales: ['en', 'ru', 'uz', 'tr'],
	defaultLocale: 'uz',
})

export default authMiddleware({
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
		'/:lng/api/mobile/(.*)',
	],
	ignoredRoutes: ['/en/api/webhook'],
})

export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
