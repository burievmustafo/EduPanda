'use client'

import { ILesson } from '@/app.types'
import useTranslate from '@/hooks/use-translate'
import { useAuth } from '@clerk/nextjs'
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Vimeo from '@vimeo/player'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	completeLesson,
	getLessonSectionId,
	getNextLesson,
} from '@/actions/lesson.action'
import { getTimedQuestionForStudent } from '@/actions/quiz.action'
import { toast } from 'sonner'
import {
	getDirectVideoUrl,
	getVimeoId,
	getYouTubeEmbedUrl,
} from '@/lib/video-url'
import TimedQuestionOverlay, {
	IStudentTimedQuestion,
} from './timed-question-overlay'

interface Props {
	lesson: ILesson
}
function VideoLesson({ lesson }: Props) {
	const [isLoading, setIsLoading] = useState(true)

	const vimeoPlayerRef = useRef<HTMLDivElement | null>(null)
	const vimeoInstanceRef = useRef<Vimeo | null>(null)
	const videoRef = useRef<HTMLVideoElement | null>(null)

	// Timed savol holati
	const [timedQ, setTimedQ] = useState<IStudentTimedQuestion | null>(null)
	const timedQRef = useRef<IStudentTimedQuestion | null>(null)
	const firedRef = useRef(false)
	const [showQ, setShowQ] = useState(false)
	const [firedTime, setFiredTime] = useState(0)

	const { courseId } = useParams()
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { userId } = useAuth()
	const t = useTranslate()
	const youtubeEmbedUrl = getYouTubeEmbedUrl(lesson.videoUrl)
	const vimeoId = getVimeoId(lesson.videoUrl)
	const directVideoUrl = getDirectVideoUrl(lesson.videoUrl)

	const pausePlayer = () => {
		videoRef.current?.pause()
		vimeoInstanceRef.current?.pause()
	}
	const resumePlayer = () => {
		videoRef.current?.play()
		vimeoInstanceRef.current?.play()
	}

	// Video vaqti yangilanganda — trigger vaqtiga yetganda savolni ochish.
	const handleTime = useCallback((seconds: number) => {
		const q = timedQRef.current
		if (!q || firedRef.current) return
		if (seconds >= q.triggerTimeSec) {
			firedRef.current = true
			setFiredTime(Math.floor(seconds))
			pausePlayer()
			setShowQ(true)
		}
	}, [])

	const onContinue = () => {
		setShowQ(false)
		resumePlayer()
	}

	const onEnd = useCallback(async () => {
		setIsLoading(true)

		const completed = completeLesson(lesson._id, userId!, pathname)

		const navigate = (async () => {
			const res = await getNextLesson(lesson._id, `${courseId}`)
			// Joriy bo'lim: avval URL'dan, bo'lmasa darsdan aniqlaymiz.
			const currentSectionId =
				searchParams.get('s') || (await getLessonSectionId(lesson._id))

			if (res?.lessonId && res.sectionId === currentSectionId) {
				// Shu bo'lim ichida keyingi dars bor — unga o'tamiz.
				router.push(`/dashboard/${courseId}/${res.lessonId}?s=${res.sectionId}`)
			} else if (currentSectionId) {
				// Bo'lim videolari tugadi — bo'lim testiga o'tamiz.
				router.push(`/dashboard/${courseId}/quiz/${currentSectionId}`)
			} else if (res?.lessonId) {
				router.push(`/dashboard/${courseId}/${res.lessonId}?s=${res.sectionId}`)
			} else {
				// Keyingisi yo'q — sahifada qolamiz, progressni yangilaymiz.
				router.refresh()
				setIsLoading(false)
			}
		})()

		const promise = Promise.all([completed, navigate])

		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfully'),
			error: t('error'),
		})
	}, [courseId, lesson._id, pathname, router, searchParams, t, userId])

	// Dars almashganda timed savolni yuklash + holatni tiklash.
	useEffect(() => {
		firedRef.current = false
		setShowQ(false)
		setTimedQ(null)
		timedQRef.current = null

		let active = true
		getTimedQuestionForStudent(lesson._id)
			.then(q => {
				if (!active) return
				setTimedQ(q)
				timedQRef.current = q
			})
			.catch(() => {})

		return () => {
			active = false
		}
	}, [lesson._id])

	useEffect(() => {
		if (vimeoPlayerRef.current && vimeoId) {
			const player = new Vimeo(vimeoPlayerRef.current, {
				id: +vimeoId,
				responsive: true,
				autoplay: true,
			})
			vimeoInstanceRef.current = player

			player.ready().then(() => setIsLoading(false))

			player.on('ended', onEnd)
			player.on('timeupdate', (data: { seconds: number }) =>
				handleTime(data.seconds)
			)

			return () => {
				player.destroy().catch(() => {})
				vimeoInstanceRef.current = null
			}
		}

		if (youtubeEmbedUrl || directVideoUrl) {
			setIsLoading(false)
		}
		if (!youtubeEmbedUrl && !vimeoId && !directVideoUrl) {
			setIsLoading(false)
		}
	}, [
		lesson,
		pathname,
		vimeoId,
		youtubeEmbedUrl,
		directVideoUrl,
		onEnd,
		handleTime,
	])

	return (
		<>
			{isLoading && (
				<div className='relative h-[20vh] w-full rounded-md bg-secondary sm:h-[30] md:h-[50vh] lg:h-[75vh]'>
					<Skeleton className='absolute right-0 top-0 flex size-full items-center justify-center rounded-md bg-slate-500/20'>
						<Loader2 className='size-6 animate-spin text-primary' />
					</Skeleton>
				</div>
			)}

			<div className='relative'>
				{youtubeEmbedUrl ? (
					<div className='aspect-video overflow-hidden rounded-md bg-black'>
						<iframe
							src={youtubeEmbedUrl}
							title={lesson.title}
							className='size-full'
							allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
							allowFullScreen
						/>
					</div>
				) : vimeoId ? (
					<div
						className={cn('max-md:sticky top-[10vh] z-50', isLoading && 'hidden')}
						ref={vimeoPlayerRef}
					/>
				) : directVideoUrl ? (
					<div className='aspect-video overflow-hidden rounded-md bg-black'>
						<video
							ref={videoRef}
							src={directVideoUrl}
							title={lesson.title}
							className='size-full'
							controls
							playsInline
							onTimeUpdate={e => handleTime(e.currentTarget.currentTime)}
							onEnded={onEnd}
						/>
					</div>
				) : (
					<div className='rounded-md bg-secondary p-4 text-sm text-muted-foreground'>
						This lesson video URL is not supported. Use a YouTube, Vimeo, or
						direct video link.
					</div>
				)}

				{showQ && timedQ && (
					<TimedQuestionOverlay
						question={timedQ}
						clerkId={userId ?? null}
						videoTimeSec={firedTime}
						onContinue={onContinue}
					/>
				)}
			</div>

			<div className='mt-4 flex flex-col gap-2 rounded-md bg-gradient-to-t from-background to-secondary p-4 md:flex-row md:items-center md:justify-between lg:p-6'>
				<h2 className='mt-4 font-space-grotesk text-2xl font-bold'>
					{lesson.title}
				</h2>
				<Button disabled={isLoading} onClick={onEnd}>
					<span className='pr-2'>{t('completeLesson')}</span>
					<CheckCircle size={18} />
				</Button>
			</div>
		</>
	)
}

export default VideoLesson
