/**
 * Mobile Home uchun 8 ta demo kurs (turli kategoriyalar).
 * Idempotent — `mobile-catalog-*` sluglari qayta yaratiladi.
 *
 *   npm run seed:mobile-catalog
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import dns from 'dns'
try {
	dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {}

import mongoose from 'mongoose'
import { connectToDatabase } from '../lib/mongoose'
import User from '../database/user.model'
import Course from '../database/course.model'
import Section from '../database/section.model'
import Lesson from '../database/lesson.model'
import Purchase from '../database/purchase.model'

const DEMO_VIDEO = 'https://www.youtube.com/watch?v=DPe_srf0GlI'
const SLUG_PREFIX = 'mobile-catalog-'

type CatalogSpec = {
	slug: string
	title: { en: string; ja: string }
	description: { en: string; ja: string }
	category: string
	level: string
	lessonCount: number
	enrollDemoStudent?: boolean
}

const CATALOG: CatalogSpec[] = [
	{
		slug: `${SLUG_PREFIX}japanese-beginners`,
		title: { en: 'Japanese for Beginners', ja: '日本語入門' },
		description: {
			en: 'Start speaking and reading Japanese from day one.',
			ja: '初日から日本語の会話と読解を始めましょう。',
		},
		category: 'Language',
		level: 'Beginner',
		lessonCount: 12,
		enrollDemoStudent: true,
	},
	{
		slug: `${SLUG_PREFIX}web-development-basics`,
		title: { en: 'Web Development Basics', ja: 'ウェブ開発の基礎' },
		description: {
			en: 'HTML, CSS, and the foundations of modern websites.',
			ja: 'HTML、CSS、そして現代のウェブサイトの基礎。',
		},
		category: 'Programming',
		level: 'Beginner',
		lessonCount: 10,
		enrollDemoStudent: true,
	},
	{
		slug: `${SLUG_PREFIX}python-foundations`,
		title: { en: 'Python Foundations', ja: 'Pythonの基礎' },
		description: {
			en: 'Variables, loops, functions, and problem solving in Python.',
			ja: '変数、ループ、関数、Pythonでの問題解決。',
		},
		category: 'Programming',
		level: 'Beginner',
		lessonCount: 14,
	},
	{
		slug: `${SLUG_PREFIX}ui-design-fundamentals`,
		title: { en: 'UI Design Fundamentals', ja: 'UIデザインの基礎' },
		description: {
			en: 'Layout, typography, and visual hierarchy for interfaces.',
			ja: 'インターフェースのレイアウト、タイポグラフィ、視覚的階層。',
		},
		category: 'User Interface',
		level: 'Intermediate',
		lessonCount: 9,
	},
	{
		slug: `${SLUG_PREFIX}ux-research-methods`,
		title: { en: 'UX Research Methods', ja: 'UXリサーチ手法' },
		description: {
			en: 'Interviews, usability tests, and insight-driven design.',
			ja: 'インタビュー、ユーザビリティテスト、インサイト主導のデザイン。',
		},
		category: 'User Experience',
		level: 'Intermediate',
		lessonCount: 8,
	},
	{
		slug: `${SLUG_PREFIX}algebra-essentials`,
		title: { en: 'Algebra Essentials', ja: '代数の基礎' },
		description: {
			en: 'Equations, graphs, and core algebra for students.',
			ja: '方程式、グラフ、学生のための代数の核心。',
		},
		category: 'Math',
		level: 'Beginner',
		lessonCount: 11,
	},
	{
		slug: `${SLUG_PREFIX}intro-physics`,
		title: { en: 'Introduction to Physics', ja: '物理学入門' },
		description: {
			en: 'Motion, energy, and the laws that describe our world.',
			ja: '運動、エネルギー、世界を記述する法則。',
		},
		category: 'Science',
		level: 'Beginner',
		lessonCount: 10,
	},
	{
		slug: `${SLUG_PREFIX}graphic-design-principles`,
		title: { en: 'Graphic Design Principles', ja: 'グラフィックデザインの原則' },
		description: {
			en: 'Color, composition, and brand-ready visual design.',
			ja: '色彩、構成、ブランドに使えるビジュアルデザイン。',
		},
		category: 'Graphic Design',
		level: 'Beginner',
		lessonCount: 7,
	},
]

async function deleteCatalogCourse(slug: string) {
	const course = await Course.findOne({ slug })
	if (!course) return
	const secs = await Section.find({ course: course._id })
	const secIds = secs.map((s: { _id: unknown }) => s._id)
	await Lesson.deleteMany({ section: { $in: secIds } })
	await Section.deleteMany({ _id: { $in: secIds } })
	await Purchase.deleteMany({ course: course._id })
	await Course.deleteOne({ _id: course._id })
}

async function createCatalogCourse(
	teacherId: mongoose.Types.ObjectId,
	spec: CatalogSpec,
) {
	const course = await Course.create({
		title: spec.title.en,
		titleI18n: spec.title,
		description: spec.description.en,
		descriptionI18n: spec.description,
		level: spec.level,
		category: spec.category,
		language: 'en',
		published: true,
		instructor: teacherId,
		slug: spec.slug,
	})

	const section = await Section.create({
		title: 'Overview',
		titleI18n: { en: 'Overview', ja: '概要' },
		position: 1,
		course: course._id,
		lessons: [],
	})

	const lessonIds = []
	for (let i = 1; i <= spec.lessonCount; i++) {
		const lesson = await Lesson.create({
			title: `Lesson ${i}`,
			titleI18n: { en: `Lesson ${i}`, ja: `レッスン ${i}` },
			content: 'Demo lesson content.',
			contentI18n: { en: 'Demo lesson content.', ja: 'デモレッスンの内容です。' },
			videoUrl: DEMO_VIDEO,
			durationSec: 480,
			free: i === 1,
			position: i,
			section: section._id,
		})
		lessonIds.push(lesson._id)
	}
	section.lessons = lessonIds
	await section.save()

	return course
}

async function seed() {
	await connectToDatabase()
	if (mongoose.connection.readyState !== 1) {
		throw new Error('MongoDB ulanmadi — .env dagi MONGODB_URL ni tekshiring')
	}

	const teacher =
		(await User.findOne({ clerkId: 'seed_teacher_edupanda' })) ||
		(await User.create({
			clerkId: 'seed_teacher_edupanda',
			fullName: 'Sato Sensei',
			role: 'instructor',
			email: 'instructor@edupanda.demo',
		}))

	const student =
		(await User.findOne({ clerkId: 'seed_student_edupanda' })) ||
		(await User.create({
			clerkId: 'seed_student_edupanda',
			fullName: 'Yuki Tanaka',
			role: 'student',
			email: 'student@edupanda.demo',
		}))

	for (const spec of CATALOG) {
		await deleteCatalogCourse(spec.slug)
	}

	const created = []
	for (const spec of CATALOG) {
		const course = await createCatalogCourse(teacher._id, spec)
		created.push(course)
		if (spec.enrollDemoStudent) {
			await Purchase.findOneAndUpdate(
				{ user: student._id, course: course._id },
				{ user: student._id, course: course._id, source: 'mock' },
				{ upsert: true },
			)
		}
	}

	console.log('\n✅ Mobile catalog seed (8 kurs):')
	for (const c of created) {
		console.log('  -', (c as { title?: string }).title, `(${String(c._id)})`)
	}
	console.log('  student enrolled:', CATALOG.filter((c) => c.enrollDemoStudent).map((c) => c.title.en).join(', '))
	console.log('\nMobil ilovada pull-to-refresh qiling.\n')

	await mongoose.disconnect()
}

seed().catch(async (err) => {
	console.error('❌ Seed xato:', err)
	await mongoose.disconnect()
	process.exit(1)
})
