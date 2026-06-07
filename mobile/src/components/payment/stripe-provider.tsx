import { StripeProvider } from '@stripe/stripe-react-native'
import type { ReactElement } from 'react'

import {
	getStripePublishableKey,
	isStripeNativeSupported,
} from '@/lib/stripe-available'

export function AppStripeProvider({ children }: { children: ReactElement | ReactElement[] }) {
	if (!isStripeNativeSupported()) {
		return children
	}

	const publishableKey = getStripePublishableKey()

	return (
		<StripeProvider
			publishableKey={publishableKey}
			merchantIdentifier="merchant.com.edupanda"
			urlScheme="edupanda">
			{children}
		</StripeProvider>
	)
}
