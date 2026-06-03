# EduPanda Mobile Coursera-Style UI/UX Implementation Ready Plan

Status: implementation blueprint  
Scope: Expo React Native mobile app only  
Deploy: not now. Vercel/web deploy stays as the final project phase.

This document turns `edupath_mobile_coursera_ui_ux_complete.md` and the 27 Coursera reference screenshots into a practical EduPanda mobile implementation plan. The goal is not to copy Coursera branding. The goal is to borrow proven learning UX patterns and rebuild them with EduPanda identity, EduPanda data, EduPanda roles, and reliable engineering.

---

## 1. Senior Assessment

The Coursera screenshots fit EduPanda very well because the product logic is the same class of app:

- course discovery
- enrolled course dashboard
- module/section progress
- video lesson player
- timed in-video questions
- transcript, notes, summary
- section/final quizzes
- grades and results
- profile/certificates
- settings, language, reminders

The references should be used as UX architecture, not as a skin. EduPanda should keep its own:

- name and brand
- color palette
- icon choices
- course content
- wording
- spacing rhythm where it improves readability

The current EduPanda mobile app already has a strong functional foundation:

- Expo Router
- TypeScript
- React Query
- i18n with English/Japanese
- student, teacher, parent, admin roles in the product direction
- course, lesson, quiz, teacher, parent routes
- YouTube/direct video support through `LessonVideo`
- timed question answer tracking
- quiz lock on backend
- parent invite/link flow

The main weakness now is not the core idea. The weakness is that the mobile app still feels like an MVP shell instead of a polished learning product. The next work should focus on design system, navigation, learning flow clarity, and state correctness.

---

## 2. What To Adopt From The Screenshots

Use these patterns directly in EduPanda:

1. Bottom tab navigation
   - Explore
   - Programs or Courses
   - Learn
   - Search
   - Profile

2. Explore screen
   - large page title
   - topic chips
   - course rails
   - compact popular course list
   - image-led course cards

3. Learn screen
   - daily goals
   - weekly activity
   - enrolled course cards
   - up-next CTA
   - empty state when user is not enrolled

4. Course dashboard
   - course header
   - horizontal tabs: Dashboard, Grades, Notes, Resources, Info
   - module selector chips
   - progress block
   - up-next lesson
   - section lesson list
   - locked/unlocked quiz state

5. Lesson player
   - video at top
   - title and section title
   - tabs: Transcript, Notes, Summary, Files
   - bottom action bar: Back, Note, Next
   - video settings bottom sheet
   - timed question markers on progress bar
   - timed question modal/sheet that pauses video

6. Settings
   - account section
   - appearance
   - language
   - notification settings
   - study reminders
   - support/legal rows

7. Profile
   - achievement/certificate cards
   - empty state if no certificates
   - settings gear

---

## 3. What Not To Copy

Do not copy:

- Coursera logo, name, exact marketing copy, exact course thumbnails, exact brand blue
- Coursera Plus as a real feature until payment logic is defined
- cast/video quality controls as fake buttons if the player cannot support them
- offline downloads until storage/download architecture exists
- forums if backend moderation and course discussion logic are not ready

For unfinished features, use one of these:

- hide behind feature flag
- show a clear "coming soon" state
- implement read-only placeholder only if it helps the flow

---

## 4. Current Codebase Fit

Current important mobile files:

- `mobile/src/constants/theme.ts`
- `mobile/src/components/screen.tsx`
- `mobile/src/components/ui-button.tsx`
- `mobile/src/components/lesson-video.tsx`
- `mobile/src/components/timed-question-modal.tsx`
- `mobile/src/app/(tabs)/_layout.tsx`
- `mobile/src/app/(tabs)/home.tsx`
- `mobile/src/app/(tabs)/learning.tsx`
- `mobile/src/app/(tabs)/profile.tsx`
- `mobile/src/app/course/[courseId].tsx`
- `mobile/src/app/learn/[lessonId].tsx`
- `mobile/src/app/quiz/[sectionId].tsx`
- `mobile/src/app/teacher/course/[courseId].tsx`
- `mobile/src/app/teacher/lesson/[lessonId]/questions.tsx`
- `mobile/src/app/parent/index.tsx`
- `mobile/src/types/dto.ts`
- `mobile/src/api/learning.ts`
- `mobile/src/api/teacher.ts`
- `mobile/src/api/me.ts`

The app can evolve without throwing away the current work. The correct move is to add a design system layer, then replace screen layouts gradually.

---

## 5. Product Navigation Decision

Recommended EduPanda mobile tabs:

```text
Explore | Courses | Learn | Search | Profile
```

Why:

- `Explore`: public course discovery
- `Courses`: structured programs/categories/certificates, can be simple at first
- `Learn`: enrolled courses and active progress
- `Search`: fast course lookup
- `Profile`: account, achievements, settings

If time is tight, start with four visible tabs:

```text
Explore | Learn | Search | Profile
```

Then add `Courses` when programs/categories are meaningful. The code should still be designed so the fifth tab is easy to add.

Role-specific areas:

- student: main tabs
- teacher: separate teacher dashboard entry from Profile or role switch
- parent: separate parent dashboard entry from Profile or role switch
- admin: do not overbuild mobile admin yet unless required

---

## 6. Design System Foundation

Before redesigning screens, create a stable design system. This prevents every screen from becoming a separate style island.

Recommended files:

```text
mobile/src/design/tokens.ts
mobile/src/design/theme.ts
mobile/src/components/ui/app-text.tsx
mobile/src/components/ui/app-button.tsx
mobile/src/components/ui/app-icon-button.tsx
mobile/src/components/ui/app-card.tsx
mobile/src/components/ui/app-divider.tsx
mobile/src/components/ui/app-bottom-sheet.tsx
mobile/src/components/ui/app-empty-state.tsx
mobile/src/components/ui/app-progress-bar.tsx
mobile/src/components/ui/app-switch.tsx
mobile/src/components/ui/settings-row.tsx
```

Token rules:

```ts
colors.primary = "#208AEF" // current EduPanda brand can stay
colors.primaryPressed = "#166FCC"
colors.primarySoft = "#EAF4FF"
colors.accentSoft = "#F1EAFE"
colors.textPrimary = "#1F2328"
colors.textSecondary = "#5F6673"
colors.background = "#FFFFFF"
colors.pageMuted = "#F5F6F8"
colors.surface = "#FFFFFF"
colors.border = "#DADDE3"
colors.divider = "#E5E7EB"
colors.success = "#16A34A"
colors.warning = "#F59E0B"
colors.danger = "#B42318"
```

Sizing rules:

```text
screen horizontal padding: 24
compact padding: 16
top-level title: 32-40
section title: 22-28
body text: 16
caption: 13-14
button height: 52-56
icon touch target: 44-48
card radius: 8-12
bottom tab height: 72 + safe area
bottom sheet radius: 24 top corners
```

Senior rule:

Do not hardcode random colors inside screens after this step. Screens should consume tokens and reusable components.

---

## 7. Data And State Rules

Every major screen must support:

- loading
- empty
- error
- loaded
- refreshing
- offline/unavailable where relevant

Learning-specific states:

- lesson has no video
- lesson has video but no transcript
- lesson has no notes
- lesson has no summary
- timed question already answered
- timed question required
- timed question optional
- section quiz locked
- section quiz unlocked
- quiz passed
- quiz failed

Never show fake success. If data is missing, show a clear empty state.

---

## 8. Core Logic That Must Stay Correct

These are product correctness rules. UI polish must not break them.

### 8.1 Timed Questions

Required behavior:

- teacher can choose a lesson video
- teacher can add zero or more timed questions
- timed questions are optional to create
- each timed question has `triggerTimeSec`
- question appears only when the video reaches that time
- question must not appear before video starts
- question must not appear if lesson has no video
- answered questions should not repeat for the same student
- required question pauses video until answer or allowed skip logic
- optional question can be skipped
- answer correctness is decided by server
- `correctOptionId` is never sent before submit

Implementation rule:

Use `answeredQuestionIds` from lesson detail and local in-memory guard for the current session. The server remains source of truth.

### 8.2 Watched Progress

Required behavior:

- progress must not jump to 100% because user seeks to the end
- progress is based on watched ranges, not just last position
- watched ranges should be merged and clamped to duration
- progress updates should be throttled
- backend should validate ranges again
- completion should require a threshold, for example 85% watched

Implementation rule:

Keep the existing watched range model and make the UI display only server-confirmed progress after save/refetch.

### 8.3 Section Quiz Lock

Required behavior:

- section quiz opens only when required lessons are completed
- frontend shows lock message
- backend enforces the same lock
- direct route navigation must not bypass the lock

This is already started on backend. Keep it.

### 8.4 Role Boundaries

Required behavior:

- parent sees only linked children
- teacher manages only own courses
- student sees own progress
- admin sees global data only in admin context

Implementation rule:

Do not rely only on mobile route visibility. Backend API must enforce ownership.

---

## 9. Screen Implementation Plan

### Sprint 1 - Design System And Navigation Shell

Goal: make the app feel intentionally designed before adding more screens.

Tasks:

- expand `mobile/src/constants/theme.ts` or move tokens into `mobile/src/design/tokens.ts`
- add base UI components
- redesign bottom tabs with active pill
- rename/reshape `home` into Explore semantics
- add Search tab route
- prepare optional Courses/Programs tab
- standardize `Screen` padding and safe-area behavior

Acceptance:

- no screen uses random one-off button/card styles for common elements
- tab bar matches Coursera-like mobile clarity but uses EduPanda brand
- TypeScript passes
- English/Japanese tab labels exist

### Sprint 2 - Explore And Search

Goal: public discovery becomes useful and polished.

Screens:

- Explore
- Search
- Search results
- Topic courses

Components:

- LargePageTitle
- TopicChip
- CoursePosterCard
- CompactCourseRow
- CourseRailSection
- SearchInput
- SearchSuggestionRow

Data:

- current courses API can be reused first
- add local grouping by category for MVP
- later add `/api/mobile/explore/home`

Acceptance:

- Explore has topic chips, course rails, popular course list
- Search has popular suggestions and real results
- course cards open course detail
- empty search state is clear
- long titles clamp cleanly

### Sprint 3 - Learn Dashboard

Goal: enrolled student sees progress and next action immediately.

Screens:

- Learn home
- Learn empty state

Components:

- DailyGoalsCard
- WeeklyActivityCard
- EnrolledCourseCard
- UpNextButton
- CourseProgressLine

Data:

- reuse student dashboard endpoint
- add computed up-next lesson if missing
- add daily/weekly mock only if backend not ready, but isolate mock in one file

Acceptance:

- no enrollment -> clear CTA to Explore
- enrolled -> course progress cards
- up-next opens correct lesson
- progress values match backend

### Sprint 4 - Course Dashboard

Goal: course detail becomes Coursera-like learning hub.

Screens:

- Course Dashboard
- Grades
- Notes
- Resources
- Info

Components:

- CourseTopHeader
- CourseTabBar
- ModuleChips
- CourseProgressBlock
- UpNextCard
- LessonListCard
- AssignmentCard
- ResourceRow
- CourseOptionsSheet

Acceptance:

- module chips switch sections
- up-next is obvious
- lesson list shows video/reading/quiz type and duration
- quiz button is locked until lessons complete
- course options bottom sheet works
- route back/next flow stays predictable

### Sprint 5 - Lesson Player UX Hardening

Goal: video learning becomes the strongest part of the app.

Screens:

- Lesson player
- Timed question modal
- Video settings sheet
- Note create/edit modal

Components:

- LearningVideoPlayerShell
- VideoProgressWithMarkers
- LessonTabs
- TranscriptPanel
- NotesPanel
- SummaryPanel
- FilesPanel
- LessonBottomNavigation
- TimedQuestionModal

Acceptance:

- YouTube video plays in Expo local
- direct video URL still works
- no-video lesson shows useful empty player state
- timed question appears at correct second
- answered question does not repeat
- optional question can be skipped
- progress does not incorrectly jump
- transcript tap seeks where supported
- notes attach to current timestamp
- summary/files empty states are clean
- bottom nav never overlaps content

### Sprint 6 - Teacher Course Builder Improvements

Goal: teacher can understand and control course content.

Screens:

- teacher dashboard
- course builder
- section builder
- add lesson
- timed question builder
- quiz builder

Teacher lesson video behavior:

- MVP: teacher pastes YouTube/direct video URL
- show video preview before save
- teacher sets duration manually if auto-detect is unavailable
- after lesson is saved, teacher can add timed questions
- timed questions are optional
- question builder shows selected lesson title, video, duration, and current questions

Future upload behavior:

- add file picker
- upload to storage
- store file URL
- process duration/thumbnail
- keep YouTube URL support

Acceptance:

- teacher always knows which lesson they are editing
- teacher cannot add timed question to a lesson without video
- teacher can create lesson without timed question
- teacher can add/edit/delete timed questions later
- teacher cannot manage another teacher's course

### Sprint 7 - Parent Dashboard

Goal: parent monitoring is clear and safe.

Screens:

- parent dashboard
- child detail
- add child by invite code

Components:

- ChildProgressCard
- CourseResultRow
- RecentQuizAttemptRow
- WeakAreaCard

Acceptance:

- parent links child by invite code
- parent sees only linked child
- child detail shows course progress, quiz score, recent activity
- no linked child -> clear empty state

### Sprint 8 - Settings, Language, Reminders

Goal: app feels complete and controllable.

Screens:

- Settings
- Language settings
- Study reminders
- Notification settings
- Account settings

Components:

- SettingsGroup
- SettingsRow
- SettingsSwitchRow
- StudyReminderRow

Implementation notes:

- language uses existing i18n store
- reminders can start with AsyncStorage + local notification
- notification permission request must be explicit
- unsupported settings should be hidden or marked coming soon

Acceptance:

- English/Japanese switch works
- settings rows align correctly
- reminders can be enabled/disabled by weekday
- reset reminders confirmation works

### Sprint 9 - QA And Performance Pass

Goal: senior-level reliability before web/deploy work.

Checks:

- `cd mobile && npx tsc --noEmit`
- run Expo locally
- test Android viewport manually
- test narrow/small device layouts
- test all roles
- test empty/loading/error states
- test long English/Japanese text
- test slow network behavior
- test video progress saves
- test quiz direct route lock

Performance rules:

- use `FlatList` for long lists
- avoid nested heavy ScrollViews
- memoize course cards if needed
- throttle video progress events
- avoid refetch loops on focus
- keep images fixed aspect ratio
- use skeletons instead of layout jumping

### Final Phase - Deploy

Do not deploy now.

Deploy only after:

- mobile local demo is stable
- web version is aligned
- role logic is verified
- database/API seed is reliable
- TypeScript and smoke tests pass
- user approves final deploy step

---

## 10. API/DTO Additions To Prepare

Add only when the screen needs it. Do not overbuild all endpoints at once.

Explore:

```ts
type ExploreHomeDTO = {
  topics: ExploreTopicDTO[];
  sections: ExploreSectionDTO[];
};

type ExploreTopicDTO = {
  id: string;
  title: LocalizedText;
  icon: string;
};

type ExploreSectionDTO = {
  id: string;
  title: LocalizedText;
  layout: "rail" | "compactList";
  courses: CourseDTO[];
};
```

Course dashboard:

```ts
type CourseDashboardDTO = {
  course: CourseDTO;
  activeSectionId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  upNextLessonId?: string;
  sections: SectionDTO[];
};
```

Transcript:

```ts
type TranscriptSegmentDTO = {
  id: string;
  startSec: number;
  endSec: number;
  text: LocalizedText;
};
```

Notes:

```ts
type LessonNoteDTO = {
  id: string;
  lessonId: string;
  startSec: number;
  text: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

Settings:

```ts
type UserSettingsDTO = {
  theme: "light" | "dark" | "system";
  preferredLanguage: "en" | "ja";
  automaticTranslations: boolean;
  courseNotificationsEnabled: boolean;
  studyRemindersEnabled: boolean;
};
```

---

## 11. Screenshot-To-EduPanda Mapping

| Screenshot group | Coursera pattern | EduPanda implementation |
| --- | --- | --- |
| Explore topics/cards | Discovery home | Explore tab with topic chips, rails, popular list |
| Auth/login | Account conversion | Auth landing/login/signup later; guest can browse |
| Empty Learn/Profile | Helpful empty states | Learn/Profile empty states with one CTA |
| Learn goals | Progress motivation | Daily goals + weekly activity in Learn |
| Course dashboard | Course hub | Course tabs, module chips, progress, up-next |
| Course grades | Assignment results | Section quiz attempts and scores |
| Course resources/info | Reference content | Resources/Info tabs with empty states |
| Lesson video | Learning workspace | Video + Transcript/Notes/Summary/Files |
| Lesson notes | Timestamped notes | Student notes linked to video time |
| Video options | Bottom sheet controls | Only real supported controls visible |
| Study reminders | Retention loop | Local notifications later, settings-ready now |
| Settings | App control center | Language/theme/notifications/account |
| Profile certificates | Achievement proof | Certificates/quiz completion cards |

---

## 12. Visual Quality Rules

Every mobile screen must pass these:

- text never overlaps
- button labels fit
- cards have stable dimensions
- list rows have consistent height/padding
- touch targets are at least 44dp
- empty states are centered and useful
- bottom tab does not cover content
- bottom action bar does not cover content
- Japanese text does not break layout
- long course titles clamp to 2 lines in cards
- no one-off colors outside tokens
- no fake disabled-looking primary action

---

## 13. Functional QA Checklist

Student:

- browse courses
- search courses
- open course detail
- enroll or see protected action prompt
- open lesson
- video loads if URL exists
- no-video state is clear
- timed question appears at intended time
- answered timed question does not repeat
- watched progress updates correctly
- section quiz stays locked until lessons complete
- quiz submit returns score

Teacher:

- create course
- create section
- create lesson with YouTube URL
- preview video
- save lesson without timed questions
- add timed question later
- see existing timed questions
- create section quiz
- cannot manage another teacher's course

Parent:

- add child by invite code
- see only linked child
- view child progress and quiz results

General:

- English/Japanese switch works
- loading states appear
- errors are readable
- back/next routes do not trap user
- TypeScript passes

---

## 14. Immediate Next Coding Order

When implementation starts, do this exact order:

1. Build design tokens and base UI components.
2. Upgrade bottom tab navigator.
3. Convert current Home tab into Explore.
4. Add Search tab.
5. Upgrade Learn tab with empty/enrolled states.
6. Upgrade Course detail into Course Dashboard tabs.
7. Upgrade Lesson Player UI around existing video/timed-question logic.
8. Improve Teacher course builder UI.
9. Improve Parent dashboard UI.
10. Add Settings and Study Reminders.
11. Run full QA.
12. Only then think about web polish and deployment.

This order protects the working logic while raising the product quality step by step.

---

## 15. Definition Of Done

The mobile UI/UX work is done when:

- app looks coherent across all student screens
- teacher flow is understandable without explanation
- parent flow is safe and clear
- timed question logic works reliably
- quiz lock cannot be bypassed
- video progress is trustworthy
- all important empty/loading/error states exist
- English/Japanese UI works
- `npx tsc --noEmit` passes inside `mobile`
- Expo local demo can be shown confidently

