import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { syncPictureFromClerk } from '@/lib/mobile/profile-picture'

export async function GET(req: Request) {
	try {
		const { user, role } = await requireUser(req)

		let picture = user.picture
		if (user.clerkId) {
			const synced = await syncPictureFromClerk(user.clerkId, user.picture)
			if (synced && synced !== user.picture) {
				user.picture = synced
				await user.save()
			}
			picture = synced ?? picture
		}

		return ok({
			id: String(user._id),
			clerkId: user.clerkId,
			fullName: user.fullName,
			email: user.email,
			picture,
			role,
		})
	} catch (e) {
		return handleError(e)
	}
}

export async function PATCH(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		const body = await req.json().catch(() => ({}))

		if (typeof body.fullName === 'string') {
			user.fullName = body.fullName.trim().slice(0, 80)
		}
		if (typeof body.email === 'string') {
			user.email = body.email.trim().toLowerCase().slice(0, 120)
		}
		await user.save()

		let picture = user.picture
		if (user.clerkId) {
			picture = (await syncPictureFromClerk(user.clerkId, user.picture)) ?? picture
			if (picture && picture !== user.picture) {
				user.picture = picture
				await user.save()
			}
		}

		return ok({
			id: String(user._id),
			clerkId: user.clerkId,
			fullName: user.fullName,
			email: user.email,
			picture: picture ?? user.picture,
			role,
		})
	} catch (e) {
		return handleError(e)
	}
}
