# EduPanda

Online learning platform with a **Next.js web app** and an **Expo (React Native) mobile app**. Students browse courses, watch lessons, answer timed questions, and take section quizzes. Instructors manage courses, sections, lessons, and quizzes from the web dashboard.

**Live demo (web):** [https://edu-panda-wine.vercel.app](https://edu-panda-wine.vercel.app)

## Project structure

```
├── app/                 # Next.js App Router (web + /api/mobile/* backend)
├── actions/             # Server actions
├── components/          # Web UI components
├── database/            # Mongoose models
├── lib/                 # Shared server utilities
├── locales/             # Web i18n (en, ja)
├── mobile/              # Expo React Native app (Android / iOS)
└── scripts/             # DB seed scripts
```

| App | Stack | Auth | API |
|-----|--------|------|-----|
| **Web** | Next.js 14, React, Tailwind, shadcn/ui | Clerk | Server Actions + MongoDB |
| **Mobile** | Expo SDK 54, React Native, Expo Router | Clerk Expo | `/en/api/mobile/*` on the Next.js backend |

## Features

### Web
- Course catalog, enrollment, Stripe payments
- Student dashboard (lessons, progress, section quizzes)
- Instructor dashboard (course builder, sections, lessons, timed questions, quizzes)
- Admin tools
- Localization: **English** and **Japanese** (`/en`, `/ja`)
- AI course draft generation (OpenAI)
- Course import / export (JSON package)

### Mobile
- Browse and enroll in courses
- Video lessons with timed in-video questions
- Section quizzes with attempt history, retake, and result review
- Saved courses, learning progress, course reviews
- Teacher dashboard (basic course management)
- Localization: **English** and **Japanese**
- Android APK builds via **EAS Build**

## Tech stack

**Frontend (web):** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, i18next, React Hook Form, Zod

**Mobile:** Expo, React Native, Expo Router, TanStack Query, i18next, Clerk Expo, Stripe React Native, expo-video

**Backend:** Next.js Route Handlers (`/api/mobile/*`), Server Actions, Mongoose, MongoDB

**Services:** Clerk (auth), Stripe (payments), OpenAI (AI course builder), Hygraph (blog CMS), Telegram (notifications), Vimeo / YouTube (video), TinyMCE (rich text)

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB database
- Clerk application (web + mobile redirect URLs)
- Accounts for Stripe, etc. as needed (see `.env.example`)

### 1. Clone the repository

```bash
git clone https://github.com/burievmustafo/EduPanda.git
cd EduPanda
```

### 2. Web app

```bash
npm install
cp .env.example .env
# Fill in .env with your keys (never commit this file)
npm run dev
```

Web app: [http://localhost:3000](http://localhost:3000)

### 3. Mobile app

```bash
cd mobile
npm install
cp .env.example .env.local
# Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (same Clerk app as web)
npm start
```

Use Expo Go or a development build. In dev, the app usually talks to your local API via Metro LAN IP (`http://<your-pc-ip>:3000/en/api/mobile`). For production APKs, set `EXPO_PUBLIC_API_URL` in `mobile/eas.json` or EAS environment variables.

### 4. Android APK (EAS)

```bash
cd mobile
npx eas-cli login
npx eas build --platform android --profile preview
```

## Environment variables

Secrets are **not** stored in this repository.

| File | In Git? | Purpose |
|------|---------|---------|
| `.env` | No (`.gitignore`) | Local web secrets |
| `.env.example` | Yes | Template with **empty** placeholders |
| `mobile/.env.local` | No | Local mobile secrets |
| `mobile/.env.example` | Yes | Mobile template (`pk_test_xxx` placeholders only) |

Copy `.env.example` → `.env` and `mobile/.env.example` → `mobile/.env.local`, then add your own keys from Clerk, MongoDB, Stripe, and other dashboards.

**Do not commit** `.env`, `.env.local`, API secret keys, webhook secrets, or database connection strings.

Clerk **publishable** keys (`pk_test_…` / `pk_live_…`) may appear in client config (e.g. `eas.json`) — that is expected; **secret** keys (`sk_…`, `whsec_…`, `MONGODB_URL`, `OPENAI_API_KEY`) must stay in `.env` only.

## Useful scripts

```bash
npm run seed:edupanda        # Seed demo EduPanda data
npm run seed:mobile-catalog  # Seed mobile catalog data
```

## Deployment

- **Web:** Vercel (connect repo, add env vars from `.env.example`)
- **Mobile:** EAS Build (`mobile/eas.json`) → APK / AAB
- **Database:** MongoDB Atlas or self-hosted

See `DEPLOY_GUIDE.md` and `HANDOFF.md` for more detail.

## License

Private / educational project. Check with the repository owner before reuse.
