import { loadEnvConfig } from '@next/env'
import { clerkClient } from '@clerk/nextjs'

loadEnvConfig(process.cwd())

const ids = process.argv.slice(2)

async function main() {
	for (const id of ids) {
		try {
			const u = await clerkClient.users.getUser(id)
			const email =
				u.emailAddresses?.find((e) => e.id === u.primaryEmailAddressId)
					?.emailAddress || u.emailAddresses?.[0]?.emailAddress
			console.log(
				JSON.stringify({
					id: u.id,
					email,
					name: [u.firstName, u.lastName].filter(Boolean).join(' '),
					createdAt: u.createdAt,
				})
			)
		} catch (e) {
			console.log(`${id}: Clerk xato -`, (e as Error).message)
		}
	}
}

main()
