import mongoose from 'mongoose'
import { loadEnvConfig } from '@next/env'
import { connectToDatabase } from '../lib/mongoose'
import User from '../database/user.model'

loadEnvConfig(process.cwd())

async function main() {
	await connectToDatabase()
	console.log(`DB: ${mongoose.connection.db?.databaseName}`)

	const total = await User.countDocuments()
	console.log(`Jami userlar: ${total}\n`)

	const approved = await User.find({ approvedInstructor: true })
		.select('email fullName role isAdmin clerkId approvedInstructor')
		.lean()
	console.log(`approvedInstructor=true (${approved.length}):`)
	for (const u of approved) {
		console.log(
			`  ${u.email || '(email yoq)'} | ${u.fullName} | role=${u.role} | admin=${u.isAdmin} | clerk=${u.clerkId?.slice(0, 20)}`
		)
	}

	const names = await User.find({
		fullName: { $regex: /hashira|yamada/i },
	})
		.select('email fullName role approvedInstructor clerkId')
		.lean()
	console.log(`\nHashira/Yamada ism bo'yicha (${names.length}):`)
	for (const u of names) {
		console.log(`  ${u.email} | ${u.fullName} | approved=${u.approvedInstructor}`)
	}

	const recent = await User.find()
		.sort({ _id: -1 })
		.limit(10)
		.select('email fullName role approvedInstructor clerkId')
		.lean()
	console.log(`\nOxirgi 10 user:`)
	for (const u of recent) {
		console.log(
			`  ${u.email || '(email yoq)'} | ${u.fullName} | approved=${u.approvedInstructor} | role=${u.role}`
		)
	}

	await mongoose.disconnect()
	console.log('\nTugadi.')
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
