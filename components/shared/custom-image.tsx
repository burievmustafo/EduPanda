'use client'

import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
	src: string
	alt: string
	className?: string
}
function CustomImage({ alt, src, className }: Props) {
	const [loading, setLoading] = useState(true)

	if (!src || src === '/assets/hero.png') {
		return (
			<div className='flex size-full items-center justify-center bg-muted'>
				<div className='flex flex-col items-center gap-1 text-muted-foreground'>
					<ImageOff className='size-8' />
					<span className='text-xs'>No Image</span>
				</div>
			</div>
		)
	}

	return (
		<Image
			src={src}
			alt={alt}
			fill
			sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
			className={cn(
				'object-cover duration-700 ease-in-out transition-all scale-100 blur-0 grayscale-0',
				loading && 'scale-110 blur-2xl grayscale',
				className
			)}
			onLoad={() => setLoading(false)}
		/>
	)
}

export default CustomImage
