import mongoose from 'mongoose'
import { loadEnvConfig } from '@next/env'
import { connectToDatabase } from '../lib/mongoose'
import Notification from '../database/notification.model'

loadEnvConfig(process.cwd())

async function main() {
	await connectToDatabase()
	console.log(`DB: ${mongoose.connection.db?.databaseName}`)

	const items = await Notification.find({
		message: { $regex: /instructor|Instructor|role/i },
	})
		.sort({ createdAt: -1 })
		.limit(30)
		.lean()

	console.log(`Instructor-related notifications (${items.length}):`)
	for (const n of items) {
		console.log(`  user=${n.user} | ${n.message} | ${n.createdAt}`)
	}

	const recent = await Notification.find()
		.sort({ createdAt: -1 })
		.limit(15)
		.lean()
	console.log(`\nOxirgi 15 notification:`)
	for (const n of recent) {
		console.log(`  user=${n.user?.slice(0, 24)} | ${n.message}`)
	}

	await mongoose.disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
