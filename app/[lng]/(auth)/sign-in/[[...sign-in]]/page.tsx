'use client'

import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'

export default function Page() {
	const { resolvedTheme } = useTheme()
	const params = useParams()
	const lng = (params?.lng as string) || 'en'

	return (
		<SignIn
			appearance={{ baseTheme: resolvedTheme === 'dark' ? dark : undefined }}
			routing='path'
			path={`/${lng}/sign-in`}
			signUpUrl={`/${lng}/sign-up`}
			afterSignInUrl={`/${lng}`}
			afterSignUpUrl={`/${lng}`}
		/>
	)
}
