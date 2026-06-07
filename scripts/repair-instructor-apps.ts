/**
 * Clerk'da bor, lekin MongoDB'ga yozilmagan instructor arizalarini tiklaydi.
 *
 * npx tsx scripts/repair-instructor-apps.ts
 * npx tsx scripts/repair-instructor-apps.ts user_xxx user_yyy
 */
import { loadEnvConfig } from '@next/env'
import { Clerk } from '@clerk/backend'
import { connectToDatabase } from '../lib/mongoose'
import User from '../database/user.model'
import Notification from '../database/notification.model'
import mongoose from 'mongoose'

loadEnvConfig(process.cwd())

async function syncClerkUser(clerkId: string) {
	const secretKey = process.env.CLERK_SECRET_KEY
	if (!secretKey) {
		throw new Error('CLERK_SECRET_KEY topilmadi')
	}

	const clerk = Clerk({ secretKey })
	const clerkUser = await clerk.users.getUser(clerkId)
	const email =
		clerkUser.emailAddresses?.find(
			(e) => e.id === clerkUser.primaryEmailAddressId
		)?.emailAddress ||
		clerkUser.emailAddresses?.[0]?.emailAddress ||
		''
	const fullName =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
		email.split('@')[0] ||
		'User'

	let user =
		(await User.findOne({ clerkId })) ||
		(email ? await User.findOne({ email }) : null)

	if (user) {
		user.clerkId = clerkId
		user.email = email || user.email
		user.fullName = fullName || user.fullName
		user.picture = clerkUser.imageUrl || user.picture
		user.approvedInstructor = true
		if (!user.role || user.role === 'student') user.role = 'student'
		await user.save()
		console.log(`Yangilandi: ${email} (${clerkId})`)
		return user
	}

	user = await User.create({
		clerkId,
		email,
		fullName,
		picture: clerkUser.imageUrl,
		role: 'student',
		isAdmin: false,
		approvedInstructor: true,
	})
	console.log(`Yaratildi: ${email} (${clerkId})`)
	return user
}

async function main() {
	let clerkIds = process.argv.slice(2)

	await connectToDatabase()

	if (!clerkIds.length) {
		const rows = await Notification.find({ message: 'messageInstructorApproved' })
			.sort({ createdAt: -1 })
			.lean()
		clerkIds = [...new Set(rows.map((r) => r.user as string))]
	}

	for (const clerkId of clerkIds) {
		const exists = await User.findOne({ clerkId }).lean()
		if (exists?.approvedInstructor) {
			console.log(`O'tkazildi (allaqachon pending): ${exists.email}`)
			continue
		}

		try {
			await syncClerkUser(clerkId)
		} catch (e) {
			console.error(`Xato ${clerkId}:`, (e as Error).message)
		}
	}

	const pending = await User.find({
		approvedInstructor: true,
		role: { $ne: 'instructor' },
		isAdmin: { $ne: true },
	})
		.select('email fullName role')
		.lean()

	console.log(`\nPending arizalar (${pending.length}):`)
	for (const u of pending) {
		console.log(`  ${u.email} | ${u.fullName}`)
	}

	await mongoose.disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
