import { auth } from '@clerk/nextjs'
import Link from 'next/link'
import { connectToDatabase } from '@/lib/mongoose'
import Course from '@/database/course.model'
import User from '@/database/user.model'
import Purchase from '@/database/purchase.model'

const CAT_COLORS: Record<string, string> = {
	Programming: '#208AEF',
	Language: '#16a34a',
	General: '#9333ea',
	Math: '#ea580c',
	Science: '#0891b2',
}
const catColor = (c: string) => CAT_COLORS[c] ?? '#208AEF'

async function getCourses(userId: string | null) {
	await connectToDatabase()
	const courses = await Course.find({ published: true })
		.populate('instructor', 'fullName')
		.lean()
	const enrolledIds = userId
		? new Set(
				(await Purchase.find({ user: userId }).select('course').lean()).map((p: any) =>
					String(p.course)
				)
		  )
		: new Set()
	return courses.map((c: any) => ({
		id: String(c._id),
		slug: c.slug,
		titleEn: c.titleI18n?.en || c.title || '',
		titleJa: c.titleI18n?.ja || '',
		descEn: c.descriptionI18n?.en || c.description || '',
		level: c.level || '',
		category: c.category || '',
		instructor: c.instructor?.fullName || '',
		isEnrolled: enrolledIds.has(String(c._id)),
	}))
}

export default async function EduPandaPage({
	params: { lng },
}: {
	params: { lng: string }
}) {
	const { userId } = auth()
	let dbUserId: string | null = null
	if (userId) {
		await connectToDatabase()
		const u = await User.findOne({ clerkId: userId }).select('_id').lean()
		dbUserId = u ? String((u as any)._id) : null
	}
	const courses = await getCourses(dbUserId)
	const isJa = lng === 'ja'

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950">
			{/* Hero */}
			<section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-extrabold mb-4">EduPanda</h1>
					<p className="text-xl opacity-90 mb-8">
						{isJa
							? 'ビデオレッスンとインタラクティブなクイズで学ぼう'
							: 'Learn with video lessons and interactive quizzes'}
					</p>
					{!userId && (
						<Link
							href={`/${lng}/sign-in`}
							className="bg-white text-blue-700 font-bold px-8 py-3 rounded-full text-lg hover:bg-blue-50 transition">
							{isJa ? 'はじめる' : 'Get started'}
						</Link>
					)}
				</div>
			</section>

			{/* Course list */}
			<section className="max-w-5xl mx-auto px-4 py-12">
				<h2 className="text-2xl font-bold mb-6">{isJa ? 'コース一覧' : 'All Courses'}</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{courses.map((c) => (
						<Link
							key={c.id}
							href={`/${lng}/edupanda/course/${c.id}`}
							className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex">
							<div className="w-2 flex-shrink-0" style={{ background: catColor(c.category) }} />
							<div className="p-4 flex-1">
								<span
									className="text-xs font-bold uppercase tracking-wider"
									style={{ color: catColor(c.category) }}>
									{c.category} · {c.level}
								</span>
								<h3 className="font-bold text-lg mt-1 mb-1 line-clamp-2">
									{isJa && c.titleJa ? c.titleJa : c.titleEn}
								</h3>
								<p className="text-sm text-gray-500 line-clamp-2">{c.descEn}</p>
								<div className="mt-3 flex items-center justify-between">
									<span className="text-xs text-gray-400">{c.instructor}</span>
									{c.isEnrolled ? (
										<span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
											{isJa ? '登録済み' : 'Enrolled'}
										</span>
									) : null}
								</div>
							</div>
						</Link>
					))}
					{courses.length === 0 && (
						<p className="text-gray-500 col-span-2">
							{isJa ? 'コースがありません' : 'No courses yet'}
						</p>
					)}
				</div>
			</section>
		</main>
	)
}
