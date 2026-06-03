/**
 * EduPanda demo seed.
 *
 * Bazaga demo kurs (HTML/CSS, en/ja), video timed savollar, section test va
 * teacher/student/parent foydalanuvchilarni yozadi. Idempotent — qayta yugurtirsa
 * eski demo o'chirib qaytadan yaratadi.
 *
 * Ishga tushirish (mobile EMAS, ildiz loyihada):
 *   npx ts-node --transpile-only scripts/seed-edupanda.ts
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

// Node'ning ba'zi tarmoqlarda SRV (mongodb+srv://) resolveri ishlamaydi — ishonchli DNS o'rnatamiz.
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
import TimedQuestion from '../database/timed-question.model'
import SectionQuiz from '../database/section-quiz.model'
import QuizQuestion from '../database/quiz-question.model'
import ParentStudentLink from '../database/parent-student-link.model'

const DEMO_VIDEO = 'https://www.youtube.com/watch?v=DPe_srf0GlI'
const SLUG = 'edupanda-demo-web-basics'

async function upsertUser(
	clerkId: string,
	fullName: string,
	role: string,
	email: string
) {
	const existing = await User.findOne({ clerkId })
	if (existing) {
		existing.role = role
		existing.fullName = fullName
		await existing.save()
		return existing
	}
	return User.create({ clerkId, fullName, role, email })
}

async function cleanupOldDemo() {
	const old = await Course.findOne({ slug: SLUG })
	if (!old) return
	const secs = await Section.find({ course: old._id })
	const secIds = secs.map((s: any) => s._id)
	const lessons = await Lesson.find({ section: { $in: secIds } })
	const lessonIds = lessons.map((l: any) => l._id)
	const quizzes = await SectionQuiz.find({ section: { $in: secIds } })
	await TimedQuestion.deleteMany({ lesson: { $in: lessonIds } })
	await QuizQuestion.deleteMany({ quiz: { $in: quizzes.map((q: any) => q._id) } })
	await SectionQuiz.deleteMany({ section: { $in: secIds } })
	await Lesson.deleteMany({ _id: { $in: lessonIds } })
	await Section.deleteMany({ _id: { $in: secIds } })
	await Purchase.deleteMany({ course: old._id })
	await Course.deleteOne({ _id: old._id })
}

async function seed() {
	await connectToDatabase()
	if (mongoose.connection.readyState !== 1) {
		throw new Error('MongoDB ulanmadi — .env dagi MONGODB_URL ni tekshiring')
	}

	// 1) Foydalanuvchilar
	const teacher = await upsertUser(
		'seed_teacher_edupanda',
		'Sato Sensei',
		'teacher',
		'teacher@edupanda.demo'
	)
	const student = await upsertUser(
		'seed_student_edupanda',
		'Yuki Tanaka',
		'student',
		'student@edupanda.demo'
	)
	const parent = await upsertUser(
		'seed_parent_edupanda',
		'Kenji Tanaka',
		'parent',
		'parent@edupanda.demo'
	)

	// 2) Parent ↔ student
	await ParentStudentLink.findOneAndUpdate(
		{ parent: parent._id, student: student._id },
		{
			parent: parent._id,
			student: student._id,
			status: 'active',
			activatedAt: new Date(),
		},
		{ upsert: true }
	)

	// 3) Eski demoni tozalash
	await cleanupOldDemo()

	// 4) Kurs
	const course = await Course.create({
		title: 'Web Development Basics',
		titleI18n: { en: 'Web Development Basics', ja: 'ウェブ開発の基礎' },
		description: 'Learn the fundamentals of building websites.',
		descriptionI18n: {
			en: 'Learn the fundamentals of building websites: HTML structure and CSS styling.',
			ja: 'ウェブサイト構築の基礎を学びます：HTMLの構造とCSSのスタイリング。',
		},
		level: 'Beginner',
		category: 'Programming',
		language: 'en',
		published: true,
		instructor: teacher._id,
		slug: SLUG,
	})

	// 5) Section
	const section = await Section.create({
		title: 'Getting Started with HTML & CSS',
		titleI18n: {
			en: 'Getting Started with HTML & CSS',
			ja: 'HTMLとCSSのはじめ方',
		},
		position: 1,
		course: course._id,
		lessons: [],
	})

	// 6) Lessons
	const lesson1 = await Lesson.create({
		title: 'Introduction to HTML',
		titleI18n: { en: 'Introduction to HTML', ja: 'HTML入門' },
		content: 'HTML structures content.',
		contentI18n: {
			en: 'HTML is the language used to structure content on the web.',
			ja: 'HTMLはウェブ上のコンテンツを構造化するための言語です。',
		},
		videoUrl: DEMO_VIDEO,
		durationSec: 600,
		free: true,
		position: 1,
		section: section._id,
	})
	const lesson2 = await Lesson.create({
		title: 'Styling with CSS',
		titleI18n: { en: 'Styling with CSS', ja: 'CSSでスタイリング' },
		content: 'CSS styles web pages.',
		contentI18n: {
			en: 'CSS is used to style and lay out web pages.',
			ja: 'CSSはウェブページのスタイルとレイアウトに使われます。',
		},
		videoUrl: DEMO_VIDEO,
		durationSec: 600,
		free: false,
		position: 2,
		section: section._id,
	})
	section.lessons = [lesson1._id, lesson2._id]
	await section.save()

	// 7) Timed questions
	await TimedQuestion.create([
		{
			lesson: lesson1._id,
			triggerTimeSec: 30,
			question: { en: 'What does HTML stand for?', ja: 'HTMLとは何の略ですか？' },
			options: [
				{ id: 'a', text: { en: 'HyperText Markup Language', ja: 'ハイパーテキスト・マークアップ・ランゲージ' } },
				{ id: 'b', text: { en: 'High Tech Modern Language', ja: 'ハイテク・モダン・ランゲージ' } },
				{ id: 'c', text: { en: 'Home Tool Markup Language', ja: 'ホーム・ツール・マークアップ・ランゲージ' } },
			],
			correctOptionId: 'a',
			explanation: { en: 'HTML = HyperText Markup Language.', ja: 'HTML＝ハイパーテキスト・マークアップ・ランゲージ。' },
			order: 1,
		},
		{
			lesson: lesson1._id,
			triggerTimeSec: 75,
			question: { en: 'Which tag creates a paragraph?', ja: '段落を作るタグはどれですか？' },
			options: [
				{ id: 'a', text: { en: '<div>', ja: '<div>' } },
				{ id: 'b', text: { en: '<p>', ja: '<p>' } },
				{ id: 'c', text: { en: '<span>', ja: '<span>' } },
			],
			correctOptionId: 'b',
			explanation: { en: 'The <p> tag defines a paragraph.', ja: '<p>タグは段落を定義します。' },
			order: 2,
		},
		{
			lesson: lesson1._id,
			triggerTimeSec: 120,
			question: { en: 'Which tag creates a hyperlink?', ja: 'ハイパーリンクを作るタグはどれですか？' },
			options: [
				{ id: 'a', text: { en: '<link>', ja: '<link>' } },
				{ id: 'b', text: { en: '<href>', ja: '<href>' } },
				{ id: 'c', text: { en: '<a>', ja: '<a>' } },
			],
			correctOptionId: 'c',
			explanation: { en: 'The <a> tag creates hyperlinks.', ja: '<a>タグはハイパーリンクを作成します。' },
			order: 3,
		},
		{
			lesson: lesson2._id,
			triggerTimeSec: 45,
			question: { en: 'What does CSS stand for?', ja: 'CSSとは何の略ですか？' },
			options: [
				{ id: 'a', text: { en: 'Cascading Style Sheets', ja: 'カスケーディング・スタイル・シート' } },
				{ id: 'b', text: { en: 'Computer Style System', ja: 'コンピュータ・スタイル・システム' } },
				{ id: 'c', text: { en: 'Creative Style Sheets', ja: 'クリエイティブ・スタイル・シート' } },
			],
			correctOptionId: 'a',
			explanation: { en: 'CSS = Cascading Style Sheets.', ja: 'CSS＝カスケーディング・スタイル・シート。' },
			order: 1,
		},
	])

	// 8) Section quiz
	const quiz = await SectionQuiz.create({
		section: section._id,
		title: { en: 'HTML & CSS Final Quiz', ja: 'HTML・CSS 最終テスト' },
		passScore: 70,
	})
	await QuizQuestion.create([
		{
			quiz: quiz._id,
			order: 1,
			question: { en: 'HTML is used to ___ web content.', ja: 'HTMLはウェブコンテンツを___するために使います。' },
			options: [
				{ id: 'a', text: { en: 'structure', ja: '構造化' } },
				{ id: 'b', text: { en: 'animate', ja: 'アニメーション化' } },
				{ id: 'c', text: { en: 'compile', ja: 'コンパイル' } },
				{ id: 'd', text: { en: 'encrypt', ja: '暗号化' } },
			],
			correctOptionId: 'a',
			explanation: { en: 'HTML structures content.', ja: 'HTMLはコンテンツを構造化します。' },
		},
		{
			quiz: quiz._id,
			order: 2,
			question: { en: 'Which tag is the largest heading?', ja: '最も大きい見出しのタグは？' },
			options: [
				{ id: 'a', text: { en: '<h6>', ja: '<h6>' } },
				{ id: 'b', text: { en: '<h1>', ja: '<h1>' } },
				{ id: 'c', text: { en: '<head>', ja: '<head>' } },
				{ id: 'd', text: { en: '<title>', ja: '<title>' } },
			],
			correctOptionId: 'b',
			explanation: { en: '<h1> is the largest heading.', ja: '<h1>が最も大きい見出しです。' },
		},
		{
			quiz: quiz._id,
			order: 3,
			question: { en: 'CSS property to change text color?', ja: '文字色を変えるCSSプロパティは？' },
			options: [
				{ id: 'a', text: { en: 'font-color', ja: 'font-color' } },
				{ id: 'b', text: { en: 'text-style', ja: 'text-style' } },
				{ id: 'c', text: { en: 'color', ja: 'color' } },
				{ id: 'd', text: { en: 'background', ja: 'background' } },
			],
			correctOptionId: 'c',
			explanation: { en: 'The `color` property sets text color.', ja: '`color`プロパティが文字色を設定します。' },
		},
		{
			quiz: quiz._id,
			order: 4,
			question: { en: 'How do you add a comment in HTML?', ja: 'HTMLでコメントを書く方法は？' },
			options: [
				{ id: 'a', text: { en: '// comment', ja: '// コメント' } },
				{ id: 'b', text: { en: '/* comment */', ja: '/* コメント */' } },
				{ id: 'c', text: { en: '<!-- comment -->', ja: '<!-- コメント -->' } },
				{ id: 'd', text: { en: '# comment', ja: '# コメント' } },
			],
			correctOptionId: 'c',
			explanation: { en: 'HTML comments use <!-- -->.', ja: 'HTMLのコメントは<!-- -->を使います。' },
		},
		{
			quiz: quiz._id,
			order: 5,
			question: { en: 'Which CSS sets space inside an element?', ja: '要素の内側の余白を設定するCSSは？' },
			options: [
				{ id: 'a', text: { en: 'margin', ja: 'margin' } },
				{ id: 'b', text: { en: 'padding', ja: 'padding' } },
				{ id: 'c', text: { en: 'border', ja: 'border' } },
				{ id: 'd', text: { en: 'gap', ja: 'gap' } },
			],
			correctOptionId: 'b',
			explanation: { en: '`padding` is the inner space.', ja: '`padding`は内側の余白です。' },
		},
	])

	// 9) Enrollment (mock)
	await Purchase.findOneAndUpdate(
		{ user: student._id, course: course._id },
		{ user: student._id, course: course._id, source: 'mock' },
		{ upsert: true }
	)

	console.log('\n✅ EduPanda seed muvaffaqiyatli:')
	console.log('  course :', course._id.toString(), '(', SLUG, ')')
	console.log('  teacher:', teacher._id.toString(), '(clerkId: seed_teacher_edupanda)')
	console.log('  student:', student._id.toString(), '(clerkId: seed_student_edupanda)')
	console.log('  parent :', parent._id.toString(), '(clerkId: seed_parent_edupanda)')
	console.log('  lessons: 2, timed questions: 4, quiz questions: 5\n')

	await mongoose.disconnect()
}

seed().catch(async (err) => {
	console.error('❌ Seed xato:', err)
	await mongoose.disconnect()
	process.exit(1)
})
