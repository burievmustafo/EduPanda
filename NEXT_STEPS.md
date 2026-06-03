# EduPanda — Hozirgi Holat + Keyingi Qadamlar (Codex uchun)

> Bu hujjat **joriy holatni** (2026-06 tekshirilgan) va **batafsil keyingi qadamlarni** beradi.
> Arxitektura/konvensiyalar: `HANDOFF.md`. UI/UX yo'nalishi: `EDUPANDA_MOBILE_COURSERA_UI_UX_IMPLEMENTATION_READY_PLAN.md`.

---

## 1. ✅ Joriy holat (tekshirilgan)

**Mobil `npx tsc --noEmit` = exit 0 (sog'lom).** Branch: `eduPanda`.

### Tayyor va ishlayapti
- **Backend** (`app/[lng]/api/mobile/`): read + teacher write + access gate (pulli dars) +
  **invite-code** (`student/invite-code`, `parent/link`) + dashboardlar. MongoDB + dev-header auth.
- **Student:** home (React Query + skeleton + pull-to-refresh), course detail (rangli banner, Enroll,
  dars qulflari, **quiz gating** — barcha darslar tugagachgina test ochiladi), learn (video + timed
  savol + progress), quiz, learning dashboard, profile (**invite code yaratish**).
- **Teacher:** dashboard, create-course, builder, add-lesson (**YouTube URL** + "save & add questions"),
  **timed-question builder** (`teacher/lesson/[lessonId]/questions.tsx`), quiz builder.
- **Parent:** dashboard, child progress, **add-child** (invite code bilan ulanish).
- **🎥 Video:** `LessonVideo` komponenti — YouTube (WebView + iframe API) va to'g'ridan-to'g'ri
  (expo-video) ikkalasини qo'llab-quvvatlaydi. Timed savol va progress shu bilan bog'langan.
- Tab navigatsiya, i18n en/ja, React Query, theme.

### ⚠️ Holat eslatmalari
- **Ko'p ish uncommitted** (`git status` da ~16 M + yangi fayllar). **Avval commit qil.**
- Clerk hali Expo Go'da yo'q → `clerk-auth` branch'da, deploy paytida dev build bilan.
- Web hali EduPanda modeliga moslanmagan (eski Udemy klon).
- Codex'ning Coursera UI rejasi tayyor — UI polish bo'yicha yo'l-yo'riq.

---

## 2. 🔴 Darhol gigiyena (kod yozishdan oldin)

1. **Commit qil** — uncommitted ishni saqlash:
   ```bash
   git status                      # .env YO'Qligini tasdiqla (gitignore'da)
   git add -A
   git commit -m "Phase 3 (invite-code) + YouTube video + quiz gating + timed-q builder"
   git push origin eduPanda
   ```
   ⚠️ `.env` ni HECH QACHON commit qilma. Stage'da `node_modules`/`.env`/`.expo` yo'qligini tekshir.
2. **Hujjatlarni birlashtir** — hozir 5+ reja hujjati bor (`HANDOFF.md`, `NEXT_STEPS.md`,
   `CODE_NEXT_STEPS.md`, `MVP_TASK_BREAKDOWN.md`, 2 ta Coursera doc). Bittasini "asosiy" qil, qolganini
   `docs/archive/` ga ko'chir — chalkashlik bo'lmasin.
3. **Seed cleanup** — test paytida qo'shilgan ortiqcha kurslar DB'da bo'lishi mumkin. Kerak bo'lsa
   `scripts/seed-edupanda.ts` ni qayta yugurt (idempotent — eski demoни tozalaydi).

---

## 3. ⚠️ Korrektlik / risk checklist (UI rejasi e'tibor bermasligi mumkin)

Bularni **tekshirib/tuzatib** keyin UI polishga o't:

1. **YouTube timed-savol ishonchliligi** (`lesson-video.tsx`):
   - `LessonVideo` ga `enableTimeTracking={true}` uzatilganini tasdiqla (aks holda YouTube vaqt
     yubormaydi → savol chiqmaydi). `learn/[lessonId].tsx` 160-qatorга qara.
   - YouTube reklama/bufer vaqt-trackingni buzishi mumkin. Demo uchun **reklamasiz, qisqa** video tanla.
   - YouTube WebView'ни ishonchli "pause" qilish har doim ishlamaydi (savol modali chiqqanda video
     to'xtashini tekshir).
2. **Quiz gating + progress** (`course/[courseId].tsx` quiz `quizUnlocked` mantig'i):
   - Test "barcha dars `isCompleted`" bo'lsagina ochiladi. `isCompleted` = `watchedPercent >= 90`.
   - YouTube progress 90% ga ishonchli yetadimi? Yetmasa test abadiy qulf qoladi → yomon UX.
   - **Tavsiya:** "Mark as complete" tugmasi yoki darsни 1 marta to'liq ochish kifoya qilsin (fallback).
3. **Video davomiyligi** — teacher qo'lда `durationSec` kiritadi. YouTube uchun avtomatik olish yo'q →
   progress % noto'g'ri bo'lishi mumkin. Teacher to'g'ri kiritishига tayan yoki YouTube API'dan ol.
4. **`react-native-webview`** — Expo Go'да ishlaydi, lekin dev build/production'да ham sinab ko'r.
5. **Role-switch demo** — dev-header rejimида ishlaydi. Real Clerk'да (keyin) role onboarding `PATCH /me`
   orqali. Web Clerk bilan ishlaydi.

---

## 4. 🟠 UI/UX polish (Coursera reja asosida — Codex'ning asosiy ishi)

`EDUPANDA_MOBILE_COURSERA_UI_UX_IMPLEMENTATION_READY_PLAN.md` ni bajar. Ustuvor bloklar:

1. **Design system** — `constants/theme.ts` ni kengaytir: spacing shkala, typography, radii, shadow,
   ranglar (light/dark). Barcha ekranlar shundан foydalansin.
2. **Image-led course cards** — `Course` modeliга `previewImage` bor, lekin teacher kiritmaydi.
   Add-course/edit'ga **rasm URL** maydoni qo'sh; kartalarда rasmni ko'rsat (hozir faqat rangli band).
3. **Explore/Learn ekranlari** — home'ни Coursera uslubida: topic chips, course rails, "continue
   learning", up-next CTA, bo'sh holat.
4. **Course dashboard tabs** — Dashboard / Grades / Notes / Info gorizontal tablar.
5. **Lesson player polish** — transcript/notes/summary tablar, progress-bar'да timed-savol markerlari,
   pastki action bar (Back / Note / Next), video settings bottom-sheet.
6. **Profile + Settings** — settings ekrani (account, appearance, language, notifications/reminders),
   profile (sertifikat/achievement kartalari yoki bo'sh holat).
7. **App ikonka + splash** — `mobile/assets/images/icon.png` ni EduPanda 1024×1024 PNG bilan almashtir.

> Tugallanmagan funksiyalar uchun: "coming soon" yoki yashir — soxta tugma qo'yma.

---

## 5. 🟢 Web moslash (TOPSHIRIQ TALABI — eng muhim strategik ish)

Topshiriq **web + mobil** talab qiladi. Hozir web = eski Udemy klon.

**Yondashuv:** mavjud `/api/mobile/*` endpointlarini web'dan ham ishlat. **Web Clerk'ни to'g'ridan-to'g'ri
ishlatadi** (web'da Clerk muammosi yo'q — bu katta afzallik). Backend tayyor, faqat web UI yoz.

**Minimal EduPanda web sahifalar** (yangi `app/[lng]/edupanda/` route group):
1. Course list · 2. Course detail (enroll, qulflar) · 3. Learning page (`<video>`/react-player +
   timed savol + progress) · 4. Quiz · 5. Student/Teacher/Parent dashboardlar · 6. Teacher builder.
- en/ja: web `next-intl` ishlatadi; `titleI18n` ni `lng` bo'yicha ko'rsat.
- Auth: web Clerk session cookie → `requireUser` allaqachon `auth()` ni o'qiydi → ishlaydi.

Eski `(root)` sahifalarни qoldirib, EduPanda uchun **fokuslangan yangi sahifalar** yet.

---

## 6. ⚫ Deploy (eng oxiri)

1. **Web + API → Vercel:** env'lar (MONGODB_URL, MONGODB_DB, Clerk keylari, NEXT_PUBLIC_BASE_URL),
   deploy. Production'да `x-dev-clerk-id` avtomatik o'chadi (NODE_ENV guard) — tekshir.
2. **Mobil → EAS dev build + Clerk:** `clerk-auth` ни `eduPanda`ga merge → `eas build -p android
   --profile development` → APK. `config.ts` `API_URL` ни Vercel URL'ga.
3. Production app build: `eas build -p android --profile production`.

---

## 7. Tavsiya etilgan tartib (Codex uchun)

```
1. Commit + hujjat tozalash + risk checklist (§2, §3)
2. UI/UX polish — design system, course images, learn player (§4)  ← Codex asosiy ishi
3. Web moslash (§5)  ← topshiriq talabi
4. Deploy (§6)  ← oxirida
```

**Birinchi navbatда:** §2 (commit) → §3.1, §3.2 (YouTube timed-savol va quiz-gating korrektligi) —
chunki bu ikkisi buzilsa, butun learning oqimi ishonchsiz bo'ladi. Keyin UI polish.

---

## 8. Foydali buyruqlar

```bash
# Backend
npx next dev -H 0.0.0.0
npx ts-node --transpile-only scripts/seed-edupanda.ts

# Mobil (mobile/ ichida)
npx expo start -c
npx tsc --noEmit
npx expo export --platform android --output-dir dist-tc   # bundle tekshiruvi, keyin dist-tc o'chir

# API test
curl -s -H "x-dev-clerk-id: seed_teacher_edupanda" http://localhost:3000/en/api/mobile/teacher/dashboard
```

Seed userlar: `seed_student_edupanda` / `seed_teacher_edupanda` / `seed_parent_edupanda`.
`mobile/src/config.ts` `API_URL` ni kompyuter LAN IP'siga moslab qo'y.
