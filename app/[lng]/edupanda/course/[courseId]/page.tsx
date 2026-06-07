import { auth } from '@clerk/nextjs'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongoose'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import SectionQuiz from '@/database/section-quiz.model'
import Purchase from '@/database/purchase.model'
import User from '@/database/user.model'
import LessonProgress from '@/database/lesson-progress.model'
import TimedQuestion from '@/database/timed-question.model'

async function getData(courseId: string, clerkId: string | null) {
	await connectToDatabase()
	const course = await Course.findById(courseId).populate('instructor', 'fullName').lean()
	if (!course) return null

	let dbUser: any = null
	if (clerkId) dbUser = await User.findOne({ clerkId }).select('_id').lean()

	const isEnrolled = dbUser
		? Boolean(await Purchase.exists({ user: dbUser._id, course: courseId }))
		: false

	const sections = await Section.find({ course: courseId }).sort({ position: 1 }).lean()
	const result = []

	for (const sec of sections) {
		const lessons = await Lesson.find({ section: sec._id }).sort({ position: 1 }).lean()
		const hasQuiz = Boolean(await SectionQuiz.exists({ section: sec._id }))

		const lessonData = []
		for (const l of lessons) {
			const progress = dbUser
				? await LessonProgress.findOne({ student: dbUser._id, lesson: l._id })
						.select('watchedPercent isCompleted')
						.lean()
				: null
			const timedQCount = await TimedQuestion.countDocuments({ lesson: l._id, isPublished: true })
			lessonData.push({
				id: String(l._id),
				titleEn: (l as any).titleI18n?.en || (l as any).title || '',
				titleJa: (l as any).titleI18n?.ja || '',
				durationSec: (l as any).durationSec || 0,
				free: Boolean((l as any).free),
				timedQCount,
				progress: progress
					? { pct: (progress as any).watchedPercent, done: (progress as any).isCompleted }
					: null,
			})
		}

		result.push({
			id: String(sec._id),
			titleEn: (sec as any).titleI18n?.en || (sec as any).title || '',
			titleJa: (sec as any).titleI18n?.ja || '',
			lessons: lessonData,
			hasQuiz,
		})
	}

	return {
		id: String((course as any)._id),
		titleEn: (course as any).titleI18n?.en || (course as any).title || '',
		titleJa: (course as any).titleI18n?.ja || '',
		descEn: (course as any).descriptionI18n?.en || (course as any).description || '',
		level: (course as any).level || '',
		category: (course as any).category || '',
		instructor: (course as any).instructor?.fullName || '',
		isEnrolled,
		sections: result,
		dbUserId: dbUser ? String(dbUser._id) : null,
	}
}

function fmt(sec: number) {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function CoursePage({
	params: { lng, courseId },
}: {
	params: { lng: string; courseId: string }
}) {
	const { userId } = auth()
	const data = await getData(courseId, userId)
	if (!data) notFound()

	const isJa = lng === 'ja'
	const title = isJa && data.titleJa ? data.titleJa : data.titleEn

	const totalLessons = data.sections.reduce((s, sec) => s + sec.lessons.length, 0)

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
			{/* Header */}
			<div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
				<div className="max-w-3xl mx-auto">
					<Link href={`/${lng}/edupanda`} className="text-blue-200 hover:text-white text-sm mb-4 inline-block">
						← {isJa ? 'コース一覧' : 'All courses'}
					</Link>
					<h1 className="text-3xl font-extrabold mb-2">{title}</h1>
					<p className="opacity-80 text-sm">{data.instructor} · {totalLessons} {isJa ? 'レッスン' : 'lessons'}</p>
					<p className="mt-3 opacity-90">{data.descEn}</p>

					{!userId ? (
						<Link
							href={`/${lng}/sign-in`}
							className="mt-6 inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition">
							{isJa ? 'ログインして登録' : 'Sign in to enroll'}
						</Link>
					) : data.isEnrolled ? (
						<span className="mt-6 inline-block bg-green-400 text-green-900 font-bold px-6 py-2 rounded-full text-sm">
							✅ {isJa ? '登録済み' : 'Enrolled'}
						</span>
					) : (
						<form action={`/api/enroll/${courseId}`} method="POST">
							<button className="mt-6 bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition">
								{isJa ? '今すぐ登録' : 'Enroll now'}
							</button>
						</form>
					)}
				</div>
			</div>

			{/* Sections */}
			<div className="max-w-3xl mx-auto px-4 pt-8 space-y-4">
				{data.sections.map((sec, si) => (
					<div key={sec.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
						<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
							<h3 className="font-bold text-base">
								{isJa && sec.titleJa ? sec.titleJa : sec.titleEn}
							</h3>
						</div>
						<div className="divide-y divide-gray-100 dark:divide-gray-800">
							{sec.lessons.map((l, li) => {
								const locked = !l.free && !data.isEnrolled
								return (
									<div
										key={l.id}
										className={`px-4 py-3 flex items-center gap-3 ${locked ? 'opacity-50' : ''}`}>
										<span className="text-lg">
											{locked ? '🔒' : l.progress?.done ? '✅' : '▶️'}
										</span>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm truncate">
												{isJa && l.titleJa ? l.titleJa : l.titleEn}
											</p>
											<div className="flex items-center gap-2 mt-0.5">
												<span className="text-xs text-gray-400">{fmt(l.durationSec)}</span>
												{l.free && (
													<span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 rounded">
														{isJa ? '無料' : 'Free'}
													</span>
												)}
												{l.timedQCount > 0 && (
													<span className="text-xs text-blue-500">
														{l.timedQCount} {isJa ? '問題' : 'questions'}
													</span>
												)}
											</div>
											{l.progress && !l.progress.done && l.progress.pct > 0 && (
												<div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-1 bg-blue-500 rounded-full"
														style={{ width: `${l.progress.pct}%` }}
													/>
												</div>
											)}
										</div>
									</div>
								)
							})}
							{sec.hasQuiz && (
								<div className="px-4 py-3 flex items-center gap-3 text-blue-600">
									<span>📝</span>
									<span className="font-semibold text-sm">
										{isJa ? '最終テスト' : 'Section quiz'}
									</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</main>
	)
}
