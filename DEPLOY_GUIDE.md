# EduPanda — Deploy Qo'llanmasi

## A. Vercel Deploy (Web + API)

### 1. GitHub repo'ni Vercel'ga ulash
1. https://vercel.com → New Project
2. GitHub repo: `burievmustafo/EduPanda`
3. **Root directory:** `.` (ildiz — `startup.sammi.ac/`)
4. Framework: Next.js (avtomatik aniqlanadi)
5. Build command: `next build`

### 2. Vercel Environment Variables (Settings → Environment Variables)
Bularni **hammasi** qo'shish kerak:

```
MONGODB_URL             = mongodb+srv://224845m_db_user:...@cluster0.rcon6pi.mongodb.net/...
MONGODB_DB              = edupanda
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...  (yoki pk_live_... production uchun)
CLERK_SECRET_KEY        = sk_test_...
NEXT_CLERK_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /
NEXT_PUBLIC_BASE_URL    = https://YOUR-APP.vercel.app
NEXT_PUBLIC_GRAPHCMS_ENDPOINT = https://...  (blog uchun)
OPENAI_API_KEY          = sk-proj-...
```

### 3. Deploy
"Deploy" tugmasini bosing. ~3-5 daqiqa.

### 4. EduPanda sahifalarni tekshiring
- `https://your-app.vercel.app/en/edupanda` — kurslar
- `https://your-app.vercel.app/en/api/mobile/courses` — mobil API

### 5. Seed (birinchi deploydan keyin bir marta)
```bash
MONGODB_URL=... npx ts-node --transpile-only scripts/seed-edupanda.ts
```

---

## B. Mobil EAS Build (Development + Clerk)

### 1. Tayyorlik
```bash
# Expo akkaunt (bepul): https://expo.dev/signup
npm install -g eas-cli
eas login          # expo.dev akkaunti bilan
```

### 2. Clerk branch'ni merge
```bash
git checkout eduPanda
git merge clerk-auth   # Clerk integratsiyasi birlashtiradi
# Conflict bo'lsa: eduPanda versiyasini afzal ko'r (Clerk code'ni tekshir)
```

### 3. mobile/.env yaratish
```
EXPO_PUBLIC_API_URL=https://YOUR-APP.vercel.app/en/api/mobile
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### 4. Development build (test uchun)
```bash
cd mobile
eas build --platform android --profile development
# ~15-20 daqiqa. APK link keladi. O'rnat va sinab ko'r.
```

### 5. Production build (Play Store uchun)
```bash
eas build --platform android --profile production
# .aab fayl yaratiladi → Google Play Console'ga yuklash
```

---

## C. Clerk Production Keys (ixtiyoriy)

Hozir `pk_test_`/`sk_test_` (dev mode). Production uchun:
1. clerk.com → dashboard → API Keys → Production
2. Vercel'da `pk_live_`/`sk_live_` bilan almashtir
3. Webhook: Clerk dashboard → Webhooks → Add endpoint
   URL: `https://your-app.vercel.app/en/api/webhook`
   Events: `user.created`, `user.updated`

---

## D. Tezkor tekshirish
```
✅ https://your-app.vercel.app/en/edupanda          → kurslar
✅ https://your-app.vercel.app/en/edupanda/course/ID → kurs detail
✅ https://your-app.vercel.app/en/api/mobile/courses → JSON kurslar
✅ Mobil APK → Student: enroll, video, test
✅ Teacher: kurs yaratish
✅ Parent: farzand natijasi
```
