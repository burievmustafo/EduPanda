import mongoose from 'mongoose'
import { loadEnvConfig } from '@next/env'
import dns from 'dns'

loadEnvConfig(process.cwd())
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URI

const UserSchema = new mongoose.Schema({
	fullName: String,
	clerkId: String,
	email: String,
	role: { type: String, default: 'student' },
	isAdmin: { type: Boolean, default: false },
	approvedInstructor: { type: Boolean, default: false },
	job: String,
	bio: String,
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function main() {
	const emails = process.argv.slice(2)
	if (!emails.length) {
		console.log('Usage: npx tsx scripts/check-instructor-apps.ts email1 email2 ...')
		process.exit(1)
	}

	if (!MONGODB_URL) {
		console.log('MONGODB_URL topilmadi')
		process.exit(1)
	}

	await mongoose.connect(MONGODB_URL)

	for (const email of emails) {
		const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') }).lean()
		if (!user) {
			console.log(`\n${email}: TOPILMADI (MongoDB da yo'q)`)
			continue
		}

		const pending =
			user.approvedInstructor && user.role !== 'instructor' && !user.isAdmin

		console.log(`\n${email}:`)
		console.log(`  fullName: ${user.fullName}`)
		console.log(`  role: ${user.role}`)
		console.log(`  isAdmin: ${user.isAdmin}`)
		console.log(`  approvedInstructor: ${user.approvedInstructor}`)
		console.log(`  job: ${user.job || '(bosh)'}`)
		console.log(`  bio: ${user.bio ? user.bio.slice(0, 60) + '...' : '(bosh)'}`)
		console.log(`  clerkId: ${user.clerkId}`)
		console.log(
			pending
				? '  => Admin panelda KO\'RINISHI KERAK (pending)'
				: '  => Admin panelda pending sifatida KO\'RINMAYDI'
		)
	}

	const pendingAll = await User.find({
		approvedInstructor: true,
		role: { $ne: 'instructor' },
		isAdmin: { $ne: true },
	})
		.select('email fullName role approvedInstructor')
		.lean()

	console.log(`\n--- Barcha pending arizalar (${pendingAll.length}) ---`)
	for (const u of pendingAll) {
		console.log(`  ${u.email} | ${u.fullName} | role=${u.role}`)
	}

	await mongoose.disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
