'use client'

import { useRefresh } from '@/hooks/use-refresh'
import { Dialog, DialogContent } from '../ui/dialog'
import { Loader2 } from 'lucide-react'
import Countdown, { zeroPad } from 'react-countdown'

const MAX_REFRESH_RELOADS = 1

function RefreshModal() {
	const { isOpen, onClose } = useRefresh()

	const renderer = ({ seconds }: { seconds: number }) => (
		<span className='text-center font-space-grotesk text-5xl font-bold'>
			{zeroPad(seconds)}
		</span>
	)

	const handleComplete = () => {
		if (typeof window === 'undefined') return
		const key = 'refresh-modal-reloads'
		const current = Number(sessionStorage.getItem(key) || '0')

		if (current < MAX_REFRESH_RELOADS) {
			sessionStorage.setItem(key, String(current + 1))
			window.location.reload()
			return
		}

		onClose()
	}

	return (
		<Dialog open={isOpen}>
			<DialogContent>
				<div className='mt-4 flex items-center justify-center gap-1 text-sm uppercase opacity-70'>
					<Loader2 className='size-4 animate-spin' />
					<span>Checking</span>
				</div>
				<h1 className='text-center font-space-grotesk text-xl font-medium'>
					Please wait while we refresh your data
				</h1>
				<Countdown
					date={Date.now() + 8000}
					renderer={renderer}
					onComplete={handleComplete}
				/>
			</DialogContent>
		</Dialog>
	)
}

export default RefreshModal
