import mongoose from 'mongoose'
import { loadEnvConfig } from '@next/env'
import { connectToDatabase } from '../lib/mongoose'
import User from '../database/user.model'

loadEnvConfig(process.cwd())

const ids = process.argv.slice(2)

async function main() {
	await connectToDatabase()
	for (const clerkId of ids) {
		const user = await User.findOne({ clerkId }).lean()
		const partial = await User.findOne({
			clerkId: { $regex: clerkId.slice(0, 20) },
		}).lean()
		console.log(`\nclerkId: ${clerkId}`)
		console.log(user ? JSON.stringify(user, null, 2) : 'User TOPILMADI')
		if (!user && partial) console.log('Partial match:', partial.clerkId)
	}
	await mongoose.disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
