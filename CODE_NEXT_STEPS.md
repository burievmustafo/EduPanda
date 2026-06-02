# EduPanda — Keyingi Kod Qadamlari (yangilangan)

> **Holat:** ✅ M0 Foundation · ✅ M1 Mock mobil · ✅ M2 Backend (DB+API) ·
> ✅ M3 Real API ulanish · ✅ M4a Teacher view · ✅ M5a Parent view
>
> **Auth qarori:** Clerk tanlandi, lekin Expo Go'da ishlamaydi (native module).
> Clerk ishi `clerk-auth` branch'da saqlangan → **deploy paytida dev build bilan yoqiladi**.
> Hozir Expo Go'da `x-dev-clerk-id` (role-switch demo) bilan davom etamiz.

---

## 🔴 Phase 1 (HOZIR) — Teacher kontent yaratish

Bu eng katta qolgan funksiya: o'qituvchi haqiqiy kurs, dars, savol, test yaratadi.

### 1a. Backend WRITE endpointlar (YANGI)
`app/[lng]/api/mobile/teacher/` ostiga — har birida **ownership check**:
```
POST   /teacher/courses                 { titleI18n, descriptionI18n, level, category }
PATCH  /teacher/courses/:id             (tahrirlash / publish)
POST   /teacher/courses/:id/sections    { titleI18n, position }
POST   /teacher/sections/:id/lessons    { titleI18n, contentI18n, videoUrl, durationSec, free }
POST   /teacher/lessons/:id/timed-questions  { triggerTimeSec, question, options, correctOptionId, explanation }
POST   /teacher/sections/:id/quiz       { titleI18n, passScore }
POST   /teacher/quizzes/:id/questions   { question, options, correctOptionId, explanation }
DELETE /teacher/...                      (o'chirish)
```

### 1b. Mobil teacher yaratish ekranlari
- `teacher/create-course.tsx` — en/ja formalar (react-hook-form + zod)
- `teacher/course/[id]/builder.tsx` — section/lesson qo'shish, drag tartib
- `teacher/lesson/[id]/questions.tsx` — timed question builder (vaqt + variantlar)
- `teacher/section/[id]/quiz.tsx` — test savollari builder
- Video: hozircha URL kiritish (keyin upload — Firebase/Cloudinary)

### 1c. Natija
O'qituvchi o'z akkaunti bilan kurs yaratadi → student yoziladi → test yechadi →
teacher/parent natijani ko'radi. **To'liq real zanjir.**

---

## 🟠 Phase 2 — UI/UX yaxshilash (ko'p funksiya)

- **Holatlar:** loading skeletonlar, error xabarlar, bo'sh holatlar, pull-to-refresh
- **Student:** "Continue learning" bo'limi, **Enroll** tugmasi, dars ✅ belgilari, kurs rasmi
- **Navigatsiya:** pastki tab-bar (Home / Dashboard / Profile) yoki drawer
- **Brending:** EduPanda app ikonka + splash (hozir Expo'niki)
- **Profil ekrani:** foydalanuvchi ma'lumoti, til, chiqish
- **Qidiruv/filtr:** kurslarни kategoriya bo'yicha
- **Animatsiyalar:** o'tishlar, tugma feedback
- **React Query** (`useAsync` o'rniga) — cache, retry, refetch, optimistic update

---

## 🟡 Phase 3 — Parent ↔ Student ulanish

- `POST /student/invite-code` — student kod yaratadi
- `POST /parent/link` — parent kod bilan ulanadi
- Mobil: student "kod ulashish", parent "kod kiritish" ekranlari
- (Hozir faqat seed orqali bog'langan)

---

## 🟢 Phase 4 — Web moslash

- Web `next build` buzilmasligini tekshirish (modellar additive — xavfsiz)
- Web'da student learning sahifasi (ixtiyoriy — Coursera uslubi)
- Web teacher/parent panellari yangi modelга
- en/ja localization web'da

---

## ⚫ Phase 5 (ENG OXIRI) — Deploy + real Clerk auth

1. **EAS development build:**
   - `npm i -g eas-cli` → `eas login` (bepul Expo akkaunt)
   - `eas build:configure` → `eas build -p android --profile development`
   - APK o'rnatish (Expo Go o'rniga)
2. **Clerk yoqish:** `clerk-auth` branch'ni merge qilish → dev build'da Clerk ishlaydi
3. **Vercel deploy (web + API):**
   - Env: MongoDB Atlas (bor), Clerk **production** keys, hammasini Vercel'ga
   - `NEXT_PUBLIC_BASE_URL` → production domen
   - Mobil `EXPO_PUBLIC_API_URL` → `https://...vercel.app/en/api/mobile`
4. **Xavfsizlik:** production'da `x-dev-clerk-id` o'chadi (NODE_ENV guard) — faqat Clerk Bearer
5. **Production app build:** `eas build -p android --profile production` → APK/Play Store

---

## Tavsiya etilgan tartib

```
Phase 1 (teacher kontent)  →  Phase 2 (UI/UX)  →  Phase 3 (parent link)
   →  Phase 4 (web)  →  Phase 5 (deploy + Clerk)
```

**Hozir boshlash:** Phase 1a — teacher WRITE endpointlar (POST /teacher/courses dan).
Bu tayyor bo'lsa, o'qituvchi mobil ilovada haqiqiy kurs yarata oladi.

---

## Branchlar
- `eduPanda` — asosiy (Expo Go'da ishlaydi, dev-header auth)
- `clerk-auth` — Clerk integratsiyasi (deploy paytida dev build bilan merge)
