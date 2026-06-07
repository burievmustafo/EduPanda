import { ApiError, handleError } from '@/lib/mobile/api'

export async function POST() {
	return handleError(
		new ApiError(410, 'disabled', 'Parent invite codes are no longer supported')
	)
}
