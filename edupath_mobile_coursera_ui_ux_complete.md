# EduPanda LMS Mobile UI/UX Analysis — Coursera Mobile Screens Complete

> Maqsad: yuborilgan Coursera mobile screenshotlarini **bittalab senior UI/UX + senior React Native engineer** nuqtai nazaridan tahlil qilish va ularni o‘zimizning **EduPanda LMS** loyihamizga original dizayn bilan integratsiya qilish rejasi.
>
> Muhim: bu hujjat Coursera’ni brand, logo, nom, rang, ikon va kontent bo‘yicha 1:1 ko‘chirish uchun emas. Biz UI/UX pattern, learning flow, layout mantiqi, component structure va interaction logic’dan ilhom olamiz, lekin o‘zimizning nom, rang, spacing, icon set va design system bilan quramiz.

---

## Implementation-ready companion

Bu screenshot-by-screenshot tahlil asosiy reference sifatida qoldirildi. Uni EduPanda mobile kodiga bevosita ulash uchun alohida senior-level blueprint qo'shildi:

`EDUPANDA_MOBILE_COURSERA_UI_UX_IMPLEMENTATION_READY_PLAN.md`

Keyingi kodlashda shu companion fayl roadmap sifatida ishlatiladi: avval design system va navigation shell, keyin Explore/Search/Learn/Course/Lesson flow, undan keyin teacher/parent/settings va eng oxirida QA/deploy.

## 0. Screenshot va measurement asoslari

Yuborilgan barcha mobile screenshotlar o‘lchami:

```text
591 px × 1280 px
```

React Native dizayn uchun amaliy base:

```text
Design reference width: 393 dp
Approx scale: 591 px / 393 dp ≈ 1.5
1 dp ≈ 1.5 screenshot px
```

Shuning uchun quyidagi o‘lchamlar **dp** sifatida beriladi. Masalan, screenshotda 36 px ko‘ringan joy RN’da taxminan 24 dp bo‘ladi.

### 0.1 Global device assumptions

```text
Mobile width: 393 dp
Status bar: 24 dp
Top app bar: 64 dp
Bottom tab bar: 72 dp
Bottom safe area: 16–24 dp
Primary horizontal padding: 24 dp
Compact horizontal padding: 16 dp
Large card horizontal padding: 20–24 dp
```

### 0.2 Design system tokens

Bu tokenlar EduPanda uchun tavsiya qilinadi. Coursera blue o‘rniga original brand blue ishlatiladi.

```ts
export const colors = {
  primary: "#2563EB",
  primaryPressed: "#1D4ED8",
  primarySoft: "#EAF1FF",

  accentPurple: "#7C3AED",
  accentPurpleSoft: "#F2EAFE",

  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#B42318",

  textPrimary: "#1F2328",
  textSecondary: "#5F6673",
  textTertiary: "#8A9099",

  background: "#FFFFFF",
  pageMuted: "#F5F6F8",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F3F5",

  border: "#DADDE3",
  borderLight: "#ECEEF2",
  divider: "#E5E7EB",

  black: "#000000",
  white: "#FFFFFF",

  overlayDark: "rgba(0,0,0,0.58)",
  videoOverlay: "rgba(0,0,0,0.45)",

  tabActiveDark: "#1F2328",
  tabInactive: "#3F454D"
};
```

### 0.3 Typography tokens

```ts
export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800"
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800"
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800"
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700"
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400"
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700"
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400"
  },
  captionStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400"
  }
};
```

### 0.4 Spacing tokens

```ts
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64
};
```

### 0.5 Radius tokens

```ts
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 999
};
```

### 0.6 Common component size rules

```text
Top app bar height: 64 dp
Icon button touch size: 44–48 dp
Back icon visual size: 26–28 dp
Settings/menu icon visual size: 28 dp
Primary button height: 52 dp
Secondary/outline button height: 48–52 dp
Small chip height: 34–40 dp
Tab bar height inside page: 52–56 dp
Tab underline height: 3 dp
List row min height: 72 dp
Settings row height: 80–96 dp
Course card radius: 8–12 dp
Card border width: 1 dp
Bottom sheet top radius: 24 dp
Bottom sheet horizontal padding: 24 dp
Switch width: 56 dp
Switch height: 34 dp
Switch thumb: 26 dp
```

---

## 1. Component inventory

Bu screenshotlardan quyidagi reusable componentlar chiqadi:

```text
AppTopBar
CourseHeader
HorizontalCourseTabs
BottomTabNavigator
LearningVideoPlayer
LessonContentTabs
TranscriptList
TranscriptSegmentRow
NoteList
NoteCard
SummaryEmptyState
CourseDashboardModuleChips
CourseProgressBlock
UpNextCard
LessonCard
GradesList
GradeAssignmentCard
ResourcesList
ResourceRow
InfoInstructorRow
SettingsGroup
SettingsRow
SettingsSwitchRow
BottomSheet
BottomSheetOptionRow
StudyReminderRow
AchievementCard
DailyGoalsCard
WeeklyActivityCard
EnrolledCourseCard
```

---

## 2. Screen 01 — Study Reminders

Source: `8d2fff52-071e-4ec0-a489-f34d7b8da7bc.jpg`

### 2.1 Ekran vazifasi

Bu ekran studentga hafta kunlari bo‘yicha o‘qish eslatmalarini sozlash imkonini beradi. Har bir kun uchun alohida toggle bor. Toggle yoqilganda vaqt tanlash kerak bo‘ladi.

### 2.2 Layout tahlili

```text
Status bar
Top app bar
Intro text
Reset all reminders link
Divider
Weekday rows
```

Approx layout:

```text
Screen padding horizontal: 0 for full-width list
Top app bar:
  height: 64 dp
  paddingHorizontal: 16 dp
  back button: 48×48 dp
  title: 20/28, 800
Intro section:
  paddingTop: 24 dp
  paddingHorizontal: 24 dp
  paddingBottom: 24 dp
Reset link:
  marginTop: 24 dp
  fontSize: 16
  color: primary
Weekday row:
  height: 88 dp
  paddingHorizontal: 24 dp
  justifyContent: space-between
  borderBottom: 1 dp #E5E7EB
Switch:
  width: 56 dp
  height: 34 dp
```

### 2.3 Typography

```text
Title "Study Reminders":
  fontSize: 20
  lineHeight: 28
  weight: 800
  color: textPrimary

Intro text:
  fontSize: 16
  lineHeight: 24
  weight: 400
  color: textPrimary

Reset all reminders:
  fontSize: 16
  lineHeight: 24
  weight: 700
  color: primary

Weekday:
  fontSize: 16
  lineHeight: 22
  weight: 400 or 500
  color: textPrimary

"Choose a time":
  fontSize: 14
  lineHeight: 20
  color: textSecondary
```

### 2.4 UI states

Har bir kun uchun:

```ts
type StudyReminderDayState = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  enabled: boolean;
  time?: string; // "19:30"
};
```

State variants:

```text
OFF:
  subtitle: Choose a time
  switch gray
  row tap → time picker or toggle prompt

ON without time:
  subtitle: Choose a time
  switch blue
  immediately open time picker

ON with time:
  subtitle: 19:30
  switch blue
  row tap → edit time
```

### 2.5 UX logic

```text
1. User toggles Sunday ON.
2. App asks notification permission if not granted.
3. If permission granted, native time picker opens.
4. User picks time.
5. App schedules weekly local notification.
6. Row subtitle changes from "Choose a time" to selected time.
7. Toggle OFF cancels that weekday notification.
8. Reset all reminders shows confirm dialog.
```

Reset confirmation:

```text
Title: Reset all reminders?
Description: This will turn off all study reminder notifications.
Actions:
  Cancel
  Reset
```

### 2.6 Integration in EduPath

Route:

```text
/(student)/settings/study-reminders
```

Backend/local model:

```ts
type StudyReminder = {
  id: string;
  userId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  enabled: boolean;
  timeLocal?: string;
  timezone: string;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
};
```

MVP:

```text
Use AsyncStorage + expo-notifications.
```

Production:

```text
Store reminders in backend.
Schedule local notification on device.
```

### 2.7 Developer implementation prompt

```text
Create a React Native Expo screen named StudyRemindersScreen.

Requirements:
- Use AppTopBar with back button and title "Study Reminders".
- White background.
- Intro block with 24dp horizontal padding and text explaining reminders.
- Add blue text button "Reset all reminders".
- Render seven StudyReminderRow components.
- Each row has day name, subtitle, and right custom switch.
- Row height must be 88dp.
- Row horizontal padding must be 24dp.
- Use borderBottom 1dp #E5E7EB.
- Switch size 56x34dp, thumb 26dp.
- When a switch is turned on, request notification permission and open time picker.
- When time is selected, save it and display the time as subtitle.
- Reset button opens confirmation modal and disables all reminders.
- Implement English/Japanese i18n keys.
```

---

## 3. Screen 02 — Course Dashboard Options Bottom Sheet

Source: `7cbebe01-4251-42f7-adbd-fb55f913b332.jpg`

### 3.1 Ekran vazifasi

Course home dashboard ichida uch nuqta menu bosilganda options bottom sheet ochiladi. Orqa fon dim bo‘ladi, course dashboard ko‘rinib turadi, sheet esa pastdan chiqadi.

### 3.2 Layout tahlili

Visible background:

```text
Top course header
Horizontal tabs
Module progress
Up Next card
```

Bottom sheet:

```text
Backdrop: rgba(0,0,0,0.55)
Sheet:
  position: bottom
  width: 100%
  height: approximately 300 dp
  background: white
  borderTopLeftRadius: 24 dp
  borderTopRightRadius: 24 dp
  paddingTop: 28 dp
  paddingHorizontal: 24 dp
```

Options:

```text
Title: Options
Row 1: Available languages for this content
Row 2: Change Preferred Language
Row 3: Unenroll from course
Close button
```

### 3.3 Element sizes

```text
Sheet title:
  fontSize: 18
  lineHeight: 24
  weight: 800
  marginBottom: 24

Option row:
  height: 56–64 dp
  flexDirection: row
  alignItems: center

Icon container:
  width: 40 dp
  marginRight: 16 dp

Icon size:
  28 dp

Option label:
  fontSize: 16
  lineHeight: 24
  weight: 700

Destructive row color:
  #B42318

Close button:
  height: 52 dp
  borderWidth: 1
  borderColor: primary
  borderRadius: 6
  alignItems: center
  justifyContent: center
  marginTop: 24
```

### 3.4 UX logic

```text
Available languages:
  Opens course content language sheet.
  Shows available subtitle/transcript/resource languages.

Change Preferred Language:
  Opens global language settings.
  Changes app + course content preferred language.

Unenroll:
  Destructive action.
  Must open confirmation dialog.
  If course is paid, show warning about losing progress/access.
```

Unenroll confirm:

```text
Title: Unenroll from course?
Description: Your progress will be kept, but the course will be removed from your learning list.
Actions:
  Cancel
  Unenroll
```

### 3.5 Integration in EduPath

Reusable component:

```ts
<CourseOptionsSheet
  visible={visible}
  onClose={close}
  onOpenLanguages={openLanguages}
  onChangePreferredLanguage={openLanguageSettings}
  onUnenroll={confirmUnenroll}
/>
```

Route context:

```text
/(student)/course/[courseId]
```

### 3.6 Developer implementation prompt

```text
Build CourseOptionsBottomSheet for Expo React Native.

Design:
- Full-screen dark backdrop rgba(0,0,0,0.55).
- Bottom sheet anchored to bottom.
- Top corners radius 24dp.
- Padding top 28dp, left/right 24dp, bottom safe area + 16dp.
- Title "Options" with 18dp font and 800 weight.
- Option rows height 60dp.
- Each option has 28dp icon, 16dp gap, 16dp bold label.
- Destructive option uses danger color.
- Close button is full width, height 52dp, border 1dp primary, radius 6dp.

Logic:
- Row 1 opens language availability modal.
- Row 2 navigates to PreferredLanguageScreen.
- Row 3 opens confirm modal before unenroll.
- Sheet closes on backdrop tap and Close button.
```

---

## 4. Screen 03 — Lesson Player With Controls + Transcript

Source: `e861eefd-62f2-483a-ab49-7bd67f84a9a0.jpg`

### 4.1 Ekran vazifasi

Bu lesson detail screen. Yuqorida video player, uning ostida lesson title, section title, content tabs, transcript list va bottom navigation mavjud.

### 4.2 Layout tahlili

```text
Status bar black
Video player area
Lesson metadata block
Tabs: Transcript | Notes | Summary
Transcript content
Bottom lesson navigation
```

Approx dimensions:

```text
Video player height: 240 dp
Lesson metadata block height: 112–124 dp
Tabs height: 56 dp
Bottom lesson nav height: 72 dp + safe area
Transcript row padding: 16–24 dp
```

### 4.3 Video player UI

Overlay controls:

```text
Back icon:
  position top-left
  touch target 48×48 dp
  icon 28 dp
  color white

Top icons:
  CC
  Cast
  Settings
  touch target 48×48 dp
  icon 28 dp
  color white

Center play:
  size 64 dp
  borderRadius 32 dp
  background white
  icon blue/dark

Skip back / skip forward:
  visual icon 48 dp
  touch target 56 dp

Time label:
  bottom-left
  fontSize 16
  color white

Fullscreen:
  bottom-right
  icon 28 dp
  touch target 48 dp

Progress bar:
  height 4 dp
  bottom aligned
  track gray
  watched part primary
  thumb 12 dp
  timed question markers yellow, width 3 dp, height 24 dp
```

### 4.4 Lesson metadata

```text
Title:
  "From Abacus to Analytical Engine"
  fontSize: 18
  lineHeight: 26
  weight: 800
  marginTop: 28
  marginHorizontal: 24

Subtitle:
  "History of Computing"
  fontSize: 16
  lineHeight: 24
  color: textSecondary
  marginTop: 12
```

### 4.5 Tabs

```text
Container height: 56 dp
Tab item width: equal
Label:
  fontSize: 16
  lineHeight: 22
  activeWeight: 800
  inactiveWeight: 400 or 500
Active color: primary
Inactive color: textPrimary
Underline:
  height: 3 dp
  width: 72–88 dp
  borderRadius: 2 dp
  color: primary
Divider bottom: 1 dp #E5E7EB
```

### 4.6 Transcript list

Row structure:

```text
timestamp column:
  width: 56 dp
  fontSize: 16
  color: textPrimary

text column:
  flex: 1
  fontSize: 16
  lineHeight: 24
  color active: primary
  color inactive: textPrimary
```

Active transcript segment is blue. Tapping segment:

```text
video.seek(segment.startSec)
```

### 4.7 Bottom lesson navigation

```text
Position: fixed bottom
Height: 72 dp + safe area
Background: white
BorderTop: 1 dp #E5E7EB
PaddingHorizontal: 24 dp
Buttons:
  Back: outline
  Note: outline
  Next: outline
Button height: 52 dp
Button width:
  Back: 104 dp
  Note: 120 dp
  Next: 104 dp
Border: 1 dp primary
Radius: 5–6 dp
Icon size: 24 dp
Text: 16, 700, primary
```

### 4.8 Integration in EduPath

Route:

```text
/(student)/learn/[courseId]/[lessonId]
```

Main components:

```text
LearningVideoPlayer
LessonHeader
LessonTabs
TranscriptPanel
NotesPanel
SummaryPanel
LessonBottomNavigation
TimedQuestionModal
```

### 4.9 Developer implementation prompt

```text
Create LessonPlayerScreen.

Use a vertical layout:
1. Video player at top with 240dp height.
2. Lesson metadata block with 24dp horizontal padding.
3. Lesson tabs with 56dp height.
4. Tab content scroll area.
5. Fixed bottom navigation with Back, Note, Next.

Video:
- Use expo-video.
- Overlay controls appear on tap.
- Add top-left back icon, top-right CC/cast/settings icons.
- Add center play button 64dp.
- Add progress bar with timed question markers.
- Show currentTime/duration.
- Fullscreen button must call video fullscreen API where available.

Transcript:
- Render timestamp + text rows.
- Active segment highlighted in primary.
- Tapping segment seeks video.

Bottom nav:
- Always visible.
- Outline buttons height 52dp.
- "Note" button opens CreateNote modal with current video time.
```

---

## 5. Screen 04 — Lesson Notes Tab

Source: `38d5299b-0cc2-47f7-aaf5-6c37c5243594.jpg`

### 5.1 Ekran vazifasi

Lesson ichidagi notes tab. Student video vaqtiga bog‘langan notelarni ko‘radi, tahrirlaydi, `Show more` orqali to‘liq matnni ochadi.

### 5.2 Layout tahlili

Same shell as lesson player:

```text
Video player
Lesson title
Tabs
Notes list
Bottom nav
```

Note card row:

```text
Container:
  paddingHorizontal: 24 dp
  paddingVertical: 16 dp
  flexDirection: row

Thumbnail:
  width: 144 dp
  height: 82 dp
  borderRadius: 4 dp
  background black/lesson thumbnail
  marginRight: 16 dp

Timestamp badge:
  position bottom-right inside thumbnail
  height: 26 dp
  paddingHorizontal: 10 dp
  borderRadius: 10 dp
  background: white
  text: 14/18

Text:
  fontSize: 16
  lineHeight: 22
  maxLines: 3

Edit icon:
  size 28 dp
  touch target 44 dp
  align right

Show more:
  marginTop: 6 dp
  color: primary
  fontSize: 16
  lineHeight: 22
```

### 5.3 UX logic

```text
- Note row tap seeks video to note.startTimeSec.
- Edit icon opens EditNoteModal.
- Show more expands note text inline or opens note detail.
- Bottom "Note" button creates new note at current video time.
```

### 5.4 Data model

```ts
type LessonNote = {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  startTimeSec: number;
  endTimeSec?: number;
  thumbnailUrl?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};
```

### 5.5 Developer implementation prompt

```text
Build NotesPanel for lesson screen.

Requirements:
- Render list of notes for current lesson.
- Each note item has thumbnail 144x82dp, timestamp badge, text excerpt, edit icon, Show more link.
- Row padding: horizontal 24dp, vertical 16dp.
- Text excerpt maxLines=3 by default.
- Show more expands to full text and changes to Show less.
- Tapping thumbnail or note body seeks video to note.startTimeSec.
- Edit icon opens modal with textarea and save/delete actions.
- Empty state: show illustration + "No notes yet" + button "Create note".
```

---

## 6. Screen 05 — Lesson Summary Empty State

Source: `55aaa831-dd61-4e96-a811-6a4f33415041.jpg`

### 6.1 Ekran vazifasi

Summary tab bor, lekin hozirgi video uchun summary mavjud emas. UX’da bo‘sh holat aniq ko‘rsatilgan.

### 6.2 Layout tahlili

```text
Video player
Lesson title
Tabs
Centered empty state
Bottom navigation
```

Empty state:

```text
Container:
  flex: 1
  alignItems: center
  justifyContent: center
  paddingHorizontal: 32 dp
  paddingBottom: 120 dp

Illustration:
  width: 160 dp
  height: 120 dp

Message:
  marginTop: 20 dp
  fontSize: 16
  lineHeight: 24
  weight: 800
  color: textPrimary
  textAlign: center
```

### 6.3 Integration in EduPath

Summary source variants:

```text
Teacher-written summary
AI-generated summary
No summary
```

MVP:

```text
Summary optional. If lesson.summary is null, show empty state.
```

### 6.4 Developer implementation prompt

```text
Build SummaryPanel.

Props:
- summary?: string
- loading?: boolean

Behavior:
- If loading, show skeleton lines.
- If summary exists, render body text with 24dp padding.
- If summary missing, render centered empty state with illustration and text "This video doesn't have a summary".
- Keep bottom nav visible.
- Support English/Japanese translations.
```

---

## 7. Screen 06 — Video Options Bottom Sheet

Source: `b29b2e12-7350-4b93-a676-73e6bd4aba9e.jpg`

### 7.1 Ekran vazifasi

Video settings gear bosilganda bottom sheet ochiladi. Student video quality, playback speed, subtitle language, audio language va transcript size ni sozlaydi.

### 7.2 Layout tahlili

```text
Backdrop:
  rgba(0,0,0,0.58)

Sheet:
  height: around 420 dp
  background: white
  borderTopLeftRadius: 0 in screenshot? Actually sheet edge is square-ish, but EduPath should use 24dp.
  paddingHorizontal: 24 dp
  paddingTop: 28 dp
```

Rows:

```text
Row height: 64–72 dp
Icon column: 40 dp
Label: left
Value: right
```

### 7.3 Row specs

```text
Icon:
  size 28 dp
  color textPrimary

Label:
  fontSize 16
  lineHeight 24
  weight 800

Value:
  fontSize 16
  lineHeight 24
  color textSecondary
```

Options:

```text
Video Quality    540p
Playback Speed   Normal
Subtitle Language English
Audio Language   English
Transcript Size  100%
```

### 7.4 UX logic

Each row opens secondary picker:

```text
Video Quality:
  Auto
  240p
  360p
  540p
  720p
  1080p

Playback Speed:
  0.5x
  0.75x
  Normal
  1.25x
  1.5x
  2x

Subtitle Language:
  Off
  English
  Japanese

Audio Language:
  English
  Japanese
  Original

Transcript Size:
  75%
  100%
  125%
  150%
```

### 7.5 Data model

```ts
type VideoUserSettings = {
  userId: string;
  videoQuality: "auto" | "240p" | "360p" | "540p" | "720p" | "1080p";
  playbackRate: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
  subtitleLanguage: "off" | "en" | "ja";
  audioLanguage: "original" | "en" | "ja";
  transcriptSize: 0.75 | 1 | 1.25 | 1.5;
};
```

### 7.6 Developer implementation prompt

```text
Create VideoSettingsSheet.

Design:
- Dark backdrop.
- Bottom sheet with white background, top radius 24dp.
- Title "Options", 18dp, 800.
- Rows height 68dp.
- Left icon 28dp, label 16dp bold, right value 16dp gray.
- Use chevron only if needed; screenshot does not show chevrons, but row tap must be clear.

Interactions:
- Tapping any row opens a nested OptionPickerSheet.
- Persist selected values in Redux settings slice and AsyncStorage.
- Playback speed must immediately update the current video.
- Subtitle/audio language updates video tracks if available.
- Transcript size updates TranscriptPanel font size.
```

---

## 8. Screen 07 — Course Info Tab

Source: `90dbf182-c8a5-42e0-988a-5e8567ac5e74.jpg`

### 8.1 Ekran vazifasi

Course ichidagi Info tab. Instructor va course description ko‘rsatiladi.

### 8.2 Layout tahlili

```text
Course top header
Horizontal tabs
Gray separator
Course Instructors section
Instructor row
Gray separator
Course Description section
Text block
```

### 8.3 Sizes

Top course header:

```text
Height: 136–150 dp including status bar
Back icon left: 48 dp touch
Course provider label: 14 dp bold/gray
Course title: 18 dp, 800
Right icons:
  reminder/alarm: 48 dp touch
  kebab menu: 48 dp touch
```

Course tabs:

```text
Height: 52 dp
Horizontal scroll
Tab label: 16 dp, 800
Active underline: 3 dp black
```

Content section:

```text
Section paddingHorizontal: 24 dp
Section paddingVertical: 28 dp
Section title: 20 dp, 800
```

Instructor row:

```text
Height: 96 dp
Avatar/logo: 64×64 dp
Label: 16 dp, 400
Chevron: 28 dp
```

Description text:

```text
fontSize: 16
lineHeight: 24
color: textPrimary
```

### 8.4 Integration in EduPath

Course tabs in our app:

```text
Dashboard
Grades
Forums
Notes
Resources
Info
```

Info tab data:

```ts
type CourseInfo = {
  courseId: string;
  instructor: {
    id: string;
    name: string;
    avatarUrl?: string;
    headline?: string;
  };
  description: LocalizedText;
  learningObjectives?: LocalizedText[];
  requirements?: LocalizedText[];
};
```

### 8.5 Developer implementation prompt

```text
Implement CourseInfoTab.

Layout:
- Section "Course Instructors"
- Instructor row with avatar 64dp, name, optional headline, right chevron.
- Section "Course Description"
- Rich body text with 16dp font and 24dp line height.
- Use gray separators between sections, height 8–12dp.
- Course tabs remain sticky under header if possible.

Interaction:
- Tapping instructor opens TeacherProfileScreen.
- Links inside description should be tappable.
- Support localized description using tData().
```

---

## 9. Screen 08 — Lesson Transcript Normal State

Source: `6581ae23-8070-4d2a-87f9-f7290f0a8b82.jpg`

### 9.1 Ekran vazifasi

Video controls yashiringan holda lesson detail. Transcript active tab.

### 9.2 Layout xususiyati

Video player:

```text
Height: 242–250 dp
No visible controls except subtitles overlay
Video fills full width
```

Lesson metadata:

```text
Padding top: 24 dp
Padding horizontal: 24 dp
Title font: 18/26, 800
Subtitle: 16/24, gray
```

Transcript:

```text
Segment row top padding: 24 dp
Timestamp left width: 56 dp
Active first segment blue
Body segments black
```

### 9.3 UX detail

```text
- Transcript should scroll independently with screen.
- When video plays, active transcript segment auto-highlights.
- If active segment goes out of visible area, optionally auto-scroll to it.
- User manual scroll should temporarily disable auto-scroll for 5 seconds.
```

### 9.4 Developer implementation prompt

```text
Improve TranscriptPanel.

Requirements:
- Highlight active transcript segment based on currentTimeSec.
- Tapping segment seeks video.
- Active segment color primary.
- Timestamp column fixed width 56dp.
- Text font default 16dp, lineHeight 24dp.
- Respect transcriptSize setting from VideoSettingsSheet.
- Optional auto-scroll to active segment unless user recently scrolled manually.
```

---

## 10. Screen 09 — Course Notes Tab

Source: `bbbbf426-c6ed-4116-8223-3d9177985ae0.jpg`

### 10.1 Ekran vazifasi

Course-level notes. Bunda barcha lessonlardan olingan notelar bitta Notes tab ichida group qilib ko‘rsatiladi.

### 10.2 Layout tahlili

```text
Course header
Course tabs
Lesson group title
Note rows
Another lesson group title
Note rows
```

Group title:

```text
paddingHorizontal: 24 dp
paddingTop: 24 dp
paddingBottom: 12 dp
fontSize: 18
lineHeight: 26
weight: 500–600
```

Note row:

```text
paddingHorizontal: 24 dp
paddingVertical: 14 dp
background: pageMuted maybe per row group
thumbnail: 144×82 dp
text column
edit icon right
```

### 10.3 UX logic

```text
- Notes are grouped by lesson.
- Tapping a note opens lesson at note.startTimeSec.
- Edit icon opens note edit modal.
- Show more expands.
- If no notes, show empty state with CTA "Start a lesson and add your first note".
```

### 10.4 Integration in EduPath

Route:

```text
/(student)/course/[courseId]/notes
```

API:

```http
GET /courses/:courseId/notes
PATCH /notes/:noteId
DELETE /notes/:noteId
```

Response shape:

```ts
type CourseNotesGroup = {
  lessonId: string;
  lessonTitle: LocalizedText;
  notes: LessonNote[];
};
```

### 10.5 Developer implementation prompt

```text
Create CourseNotesTab.

Requirements:
- Fetch all notes for course grouped by lesson.
- Render lesson title then list of NoteCard components.
- NoteCard identical to Lesson Notes tab.
- Note tap navigates to /(student)/learn/[courseId]/[lessonId]?t=startTimeSec.
- Edit icon opens edit sheet.
- Empty state with illustration.
```

---

## 11. Screen 10 — Course Resources Tab

Source: `9bf17a17-ce15-4fc7-b418-270e8c1ccdfe.jpg`

### 11.1 Ekran vazifasi

Course resource documents ro‘yxati. Har row hujjat/PDF/resource ochadi.

### 11.2 Layout tahlili

```text
Course header
Tabs
Gray section top separator
Resource rows
```

Resource row:

```text
Height: 72–84 dp
PaddingHorizontal: 24 dp
Flex row
Icon left: 28 dp
Label: 16 dp
Chevron right: 28 dp
BorderBottom: none or very light
```

Icon color:

```text
primary
```

### 11.3 Resources data model

```ts
type CourseResource = {
  id: string;
  courseId: string;
  lessonId?: string;
  title: LocalizedText;
  type: "pdf" | "doc" | "link" | "subtitle" | "transcript" | "glossary";
  url: string;
  downloadable: boolean;
  language: "en" | "ja";
};
```

### 11.4 UX logic

```text
- Tap PDF resource → in-app document viewer or external browser.
- If downloadable → show download icon or offline status.
- Resources can be course-level or lesson-level.
- Filter by selected language if available.
```

### 11.5 Developer implementation prompt

```text
Build CourseResourcesTab.

Design:
- Top gray separator 12dp.
- Render ResourceRow height 80dp.
- Left document icon 28dp in primary color.
- Label 16dp, lineHeight 24dp.
- Right chevron 28dp.
- Row horizontal padding 24dp.
- On tap open ResourceViewerScreen.
- For external links use Linking.openURL with confirmation if leaving app.
```

---

## 12. Screen 11 — Course Dashboard Main

Source: `1fe425ed-9b35-4cae-bb18-e3cb08b74cfd.jpg`

### 12.1 Ekran vazifasi

Course home dashboard. Student modul tanlaydi, progress ko‘radi, download size ko‘radi, assignment due ko‘radi, up next lessonni boshlaydi.

### 12.2 Header

```text
Status bar
Course header:
  height: 136–150 dp
  left back icon
  provider name small
  course title two lines
  right reminder/alarm icon
  right kebab menu
```

Header padding:

```text
paddingHorizontal: 24 dp
Back icon touch: 48 dp
Title block marginLeft: 16 dp
Right icons gap: 8 dp
```

### 12.3 Horizontal tabs

```text
Tabs: Dashboard, Grades, Forums, Notes, ...
Height: 52 dp
Scroll horizontal if overflow
Label font: 16/22, 800
Active underline:
  height: 3 dp
  color: textPrimary
  full tab width or label width + 24
BorderBottom: 1 dp #DADDE3
```

### 12.4 Module chips

```text
Section title "Module":
  paddingHorizontal: 24 dp
  marginTop: 28 dp
  fontSize: 20
  weight: 800

Chip list:
  horizontal scroll
  marginTop: 20 dp
  paddingLeft: 24 dp
Chip:
  height: 40 dp
  minWidth: 74 dp
  borderRadius: 20 dp
  borderWidth: 1
  inactive border: #DADDE3
  active background: #1F2328
  active text: white
  circle indicator: 22 dp
```

### 12.5 Progress block

```text
Container:
  paddingHorizontal: 24 dp
  marginTop: 40 dp

Progress label:
  "0% Module Completed"
  fontSize: 18
  weight: 800

Progress bar:
  marginTop: 16 dp
  height: 5 dp
  borderRadius: 3 dp
  background: #DADDE3
  progress color: primary or accentPurple
  marker dot: 6 dp

Download block:
  right aligned
  icon: 28 dp
  label: Download
  size: 171 MB
```

### 12.6 Up Next divider

```text
Horizontal line left/right with centered "Up Next"
MarginTop: 40 dp
Line color: #DADDE3
Title font: 16/22
```

### 12.7 Up Next card

```text
Card marginHorizontal: 24 dp
MarginTop: 20 dp
Padding: 20 dp
BorderWidth: 1 dp
BorderColor: accentPurple
BorderRadius: 8 dp
Background: white
Height: 136–152 dp

Title:
  fontSize: 18
  lineHeight: 26
  weight: 800

Download icon:
  top-right
  size: 28 dp

Bottom row:
  marginTop: 32 dp
  type chip height 42 dp
  duration chip height 42 dp
  primary button height 42 dp
```

### 12.8 Integration in EduPath

This screen maps to:

```text
StudentCourseDashboardScreen
```

Route:

```text
/(student)/course/[courseId]/dashboard
```

Data:

```ts
type CourseDashboard = {
  course: Course;
  selectedModuleId: string;
  moduleProgress: number;
  assignmentDueCount: number;
  downloadableSizeMb: number;
  upNextLesson: Lesson;
  moduleDescription: LocalizedText;
  sections: Section[];
};
```

### 12.9 Developer implementation prompt

```text
Create StudentCourseDashboardScreen.

Layout:
- CourseHeader fixed at top.
- HorizontalCourseTabs below header.
- Scroll content.
- Module section with horizontal chips.
- Progress block with module progress and right download summary.
- UpNextDivider.
- UpNextCard with title, download icon, lesson type chip, duration chip, primary Up Next button.
- Module description with collapsed "more..." link.
- Section lesson cards below.

Behavior:
- Selecting module chip changes module content.
- Up Next button navigates to lesson player.
- Download tap opens DownloadModuleSheet.
- Progress updates from enrollments/videoProgress/quizAttempts.
```

---

## 13. Screen 12 — Course Dashboard Lesson Cards

Source: `4d130e2b-46a6-46cf-a049-e2d8f1546d28.jpg`

### 13.1 Ekran vazifasi

Module ichidagi lessonlar ro‘yxati card formatida. Har cardda lesson title, download icon, type chip, duration chip bor.

### 13.2 Section title divider

```text
Container:
  flexDirection: row
  alignItems: center
  paddingHorizontal: 24 dp
  marginVertical: 24 dp

Left/right line:
  height: 1 dp
  flex: 1
  background: #DADDE3

Title:
  marginHorizontal: 12 dp
  fontSize: 14–16
  weight: 700
```

### 13.3 Lesson card specs

```text
Card:
  marginHorizontal: 24 dp
  marginBottom: 12 dp
  padding: 20 dp
  minHeight: 124 dp
  background: white
  borderRadius: 8 dp
  borderWidth: 1 dp
  borderColor: #DADDE3
  shadowColor: black
  shadowOpacity: 0.05
  shadowRadius: 4
  elevation: 1

Title:
  fontSize: 17–18
  lineHeight: 25
  weight: 800
  maxLines: 2

Download icon:
  position top-right
  size: 28 dp
  touch target: 44 dp

Meta chips:
  marginTop: 28 dp
  gap: 10–12 dp
  height: 42 dp
  borderWidth: 1
  borderColor: #DADDE3
  borderRadius: 5 dp
  paddingHorizontal: 14 dp
```

### 13.4 Lesson states

```text
not_started:
  circle/none
  normal border

in_progress:
  small progress bar or label "In progress"

completed:
  check icon
  muted title or completed badge

locked:
  lock icon
  disabled opacity 0.55
```

### 13.5 Developer implementation prompt

```text
Build LessonCard.

Props:
- title
- type
- durationSec
- status
- downloadable
- onPress
- onDownload

Design:
- White card, radius 8dp, border 1dp #DADDE3.
- Padding 20dp.
- Title 18dp bold, max 2 lines.
- Download icon top right with 44dp touch area.
- Bottom row has type chip and duration chip.
- Card onPress opens lesson.
- If locked, show lock icon and reduce opacity.
- If completed, show check badge.
```

---

## 14. Screen 13 — Grades Tab

Source: `977105a7-60b4-4679-888f-4cacfa1850ac.jpg`

### 14.1 Ekran vazifasi

Course grades/assignments. Studentga assignment due, course completion condition, graded assignments va weights ko‘rsatiladi.

### 14.2 Layout tahlili

```text
Course header
Tabs
Top info area:
  icon + message
  icon + message
Assignment list
```

Top info rows:

```text
paddingHorizontal: 24 dp
paddingVertical: 20 dp
flex row
Icon illustration: 64×64 dp
Text: 16/24
```

Assignment item:

```text
Container:
  paddingHorizontal: 24 dp
  paddingVertical: 28 dp
  background: white
  borderTop/section separator: 8 dp pageMuted

Icon:
  36–40 dp

Title:
  fontSize: 16–18
  lineHeight: 26
  weight: 800

Subtitle:
  "Graded Assignment"
  fontSize: 14
  color: textSecondary

Weight:
  right aligned
  fontSize: 14
  color: textSecondary

Divider:
  marginTop: 12
  height: 1
  color: #DADDE3

Due date:
  marginTop: 12
  fontSize: 14
  color: textSecondary
```

### 14.3 Data model

```ts
type GradeItem = {
  id: string;
  courseId: string;
  moduleId: string;
  title: LocalizedText;
  type: "graded_assignment" | "section_test" | "final_exam";
  weightPercent: number;
  dueAt?: string;
  status: "not_started" | "submitted" | "graded" | "overdue";
  score?: number;
  maxScore?: number;
  passed?: boolean;
};
```

### 14.4 UX logic

```text
- Show assignment due count.
- Show requirement: pass all assignments.
- Tapping assignment opens quiz/test screen or result screen.
- Overdue items show warning.
- Completed items show score/check.
```

### 14.5 Developer implementation prompt

```text
Create GradesTab.

Design:
- Two top guidance rows with icon 64dp and text 16dp.
- Render GradeAssignmentCard list.
- Each card has icon, title, type, weight, divider, due date.
- Use section separators 8dp pageMuted.
- Tapping item opens assignment detail.
- Show score/status badges when available.
```

---

## 15. Screen 14 — Settings Account + Support

Source: `8e547879-4aa5-4739-9d26-14cd42a378b9.jpg`

### 15.1 Ekran vazifasi

Logged-in settings: account info, sign out, profile verification, recovery email, subscriptions, unlink Google, support.

### 15.2 Layout tahlili

```text
Top app bar
Section ACCOUNT
User identity row
Sign Out button
Settings rows
Section SUPPORT
Support rows
```

Top app bar:

```text
height: 64 dp
title centered
back icon left
```

Section title:

```text
paddingHorizontal: 24 dp
paddingTop: 28 dp
fontSize: 16
lineHeight: 22
weight: 800
letterSpacing: 0.5
uppercase
```

User row:

```text
height: 80 dp
paddingHorizontal: 24 dp
icon 28 dp
text block marginLeft: 24 dp
name font 17/24 bold
email font 16/22 gray
```

Sign out button:

```text
marginHorizontal: 24 dp
height: 52 dp
borderWidth: 1
borderColor: textPrimary
borderRadius: 8 dp
icon 24 dp
font 16/24 bold
```

Settings row:

```text
height: 72–84 dp
paddingHorizontal: 24 dp
icon 30 dp
label 16/24 bold
description optional 14/20 gray
chevron right 28 dp
```

### 15.3 Integration in EduPath

Route:

```text
/(student)/settings
```

Also shared for all roles, with role-specific sections.

### 15.4 Settings row model

```ts
type SettingsRowConfig = {
  id: string;
  icon: string;
  titleKey: string;
  subtitleKey?: string;
  type: "navigation" | "switch" | "button";
  destructive?: boolean;
  route?: string;
};
```

### 15.5 Developer implementation prompt

```text
Create SettingsScreen for logged-in user.

Design:
- White background, AppTopBar centered title.
- Section headers uppercase with 24dp horizontal padding.
- User identity row with icon and name/email.
- Sign out outline button 52dp height, radius 8dp.
- Settings rows 76dp min height.
- Icon column 36dp, gap 24dp, chevron right.

Logic:
- Sign out opens confirmation.
- Profile Verification navigates to verification screen.
- Recovery Email navigates to add email screen.
- My Subscriptions navigates to subscription/payment screen.
- Unlink Google opens confirm modal.
- Support rows open help/report screens.
```

---

## 16. Screen 15 — Learn Home: Goals + Current Course

Source: `eedc7284-5e04-4b1b-9752-e39b59430073.jpg`

### 16.1 Ekran vazifasi

Student asosiy Learn tab. Daily goals, weekly activity va current courses ko‘rsatiladi.

### 16.2 Layout tahlili

```text
Top row:
  Switch Catalog link left
  Settings gear right

Daily goals card
Program/provider block
Course progress card
Bottom tab navigation
```

Top row:

```text
paddingTop: safeTop + 24 dp
paddingHorizontal: 24 dp
height: 72 dp
Switch Catalog:
  fontSize 16
  weight 700
  color primary
Gear:
  icon 28 dp
  touch 48 dp
```

Daily goals card:

```text
marginHorizontal: 24 dp
marginTop: 32 dp
padding: 20 dp
borderWidth: 1
borderColor: #DADDE3
borderRadius: 8 dp
background white
```

Daily goal row:

```text
height: 56 dp
icon circle: 44 dp
title: 16/24 bold
count: 16/24 bold
```

Weekly activity:

```text
Divider: marginVertical 20, height 1
Title: 18/24 bold
Subtitle: 14/20 gray
Day chips:
  width 36–42 dp
  height 42 dp
  border 1
  radius 5
  selected border primarySoft/purple
```

Bottom tab:

```text
Height: 72 dp + safe area
Items: Explore, Career, Learn, Search, Profile
Active Learn:
  icon inside rounded pill
  pill: 64×48 dp
  background: #EDE2FF or primarySoft
  label primary bold
Inactive:
  icon gray
  label gray
```

### 16.3 Daily goals data model

```ts
type DailyGoal = {
  id: string;
  type: "lesson" | "reading" | "practice";
  target: number;
  completed: number;
};

type WeeklyActivity = {
  targetDays: number;
  completedDays: string[]; // ISO dates
};
```

### 16.4 Course card in Learn

```text
Card:
  marginHorizontal: 24 dp
  borderRadius: 8 dp
  borderWidth: 1
  shadow/elevation: 2
  background white

Course title:
  fontSize 18
  weight 800

Meta:
  Course 1 of 6 • 0% Completed
  fontSize 14–15

Progress bar:
  height 5 dp
  marginTop 20 dp
```

### 16.5 Integration in EduPath

Route:

```text
/(student)/home
```

This is the main Student dashboard.

### 16.6 Developer implementation prompt

```text
Create StudentLearnHomeScreen.

Design:
- Top header with "Switch Catalog" link and settings gear.
- DailyGoalsCard with 3 rows and WeeklyActivity section.
- Render enrolled programs/courses below.
- BottomTabNavigator fixed at bottom.

Logic:
- Goals calculated from today’s completed lessons/readings/quizzes.
- Weekly activity calculated from days with learning activity.
- Course card Up Next button opens next lesson or assignment.
- Settings gear opens SettingsScreen.
```

---

## 17. Screen 16 — Learn Home Scrolled Course Cards

Source: `7a6aba76-0704-45ec-bb89-243dc439e0e6.jpg`

### 17.1 Ekran vazifasi

Learn tabda bir nechta enrolled program/course cardlari. Har card progress va up-next itemni ko‘rsatadi.

### 17.2 Course card layout

```text
Program/provider label:
  icon/logo 28–40 dp
  provider name
  program title
  type "Professional Certificate"

Course progress card:
  marginHorizontal: 24 dp
  marginTop: 16 dp
  borderRadius: 8 dp
  borderWidth: 1
  shadow/elevation: 2
  background white
```

Inside card:

```text
Top area:
  padding: 20 dp
  title 18/26 bold
  meta 14/20
  progress bar 5 dp
  marginTop 16

Bottom next item area:
  borderTop 1 dp #E5E7EB
  padding: 20 dp
  title 18/26 bold
  bottom row chips + Up Next button
```

Up Next row:

```text
Type chip:
  height 42 dp
  border 1
  radius 5
  icon 24
  label 16 bold

Duration chip:
  height 42 dp
  paddingHorizontal 14

Up Next button:
  height 42 dp
  minWidth 120 dp
  background primary
  borderRadius 5
```

Show All row:

```text
height 56 dp
centered
chevron down icon 24
text 16/24 bold
```

### 17.3 Data model

```ts
type EnrolledCourseCardData = {
  courseId: string;
  providerName: string;
  providerLogoUrl?: string;
  programTitle?: string;
  courseTitle: LocalizedText;
  courseIndex?: number;
  totalCourses?: number;
  progressPercent: number;
  upNext: {
    itemId: string;
    itemType: "video" | "reading" | "graded_assignment";
    title: LocalizedText;
    durationMin: number;
  };
};
```

### 17.4 Developer implementation prompt

```text
Build EnrolledCourseCard.

Requirements:
- Top course progress area with title, meta, progress bar.
- Bottom next item area separated by borderTop.
- Next item has title, type chip, duration chip, Up Next primary button.
- Card radius 8dp, border 1dp, elevation 2.
- Progress bar height 5dp.
- If multiple courses in same program, show Show All collapse/expand row.
```

---

## 18. Screen 17 — Profile Achievements

Source: `9e704a17-c136-4f06-8735-ef983360e060.jpg`

### 18.1 Ekran vazifasi

Student profile. User identity, avatar, achievements/certificates va share action.

### 18.2 Layout tahlili

```text
Top row:
  Switch Catalog link
  Settings gear

Large title: Profile
User name/email/avatar
Achievements section
Achievement cards
Bottom tab
```

Profile header:

```text
paddingHorizontal: 24 dp
paddingTop: safeTop + 24 dp

Title "Profile":
  fontSize: 32
  lineHeight: 40
  weight: 800

Name:
  marginTop: 32 dp
  fontSize: 20
  lineHeight: 28
  weight: 800

Email:
  fontSize: 16
  lineHeight: 22
  color textSecondary

Avatar:
  size 72 dp
  borderRadius 36
  position right
```

Achievement section:

```text
Title:
  marginTop 32
  fontSize 20
  weight 800
```

Achievement card:

```text
marginHorizontal: 24 dp
marginTop: 16 dp
padding: 24 dp
minHeight: 230 dp
borderRadius: 8 dp
background white
shadow/elevation: 2

Certificate icon:
  width 96 dp
  height 64 dp
  center for first card
  right aligned for compact cards

Title:
  fontSize 18
  weight 800
  textAlign center or left

Provider:
  fontSize 14
  color textSecondary

Completed date/grade:
  fontSize 14
  lineHeight 20

Share button:
  height 56 dp
  background primary
  radius 6 dp
  icon 24
  text 16/24 bold white
```

### 18.3 Data model

```ts
type Achievement = {
  id: string;
  userId: string;
  title: LocalizedText;
  issuerName: string;
  completedAt?: string;
  gradePercent?: number;
  certificateUrl?: string;
  shareUrl?: string;
};
```

### 18.4 Developer implementation prompt

```text
Create ProfileScreen.

Design:
- Top link "Switch Catalog" and settings gear.
- Large "Profile" title.
- User name/email left and avatar right.
- Achievements section.
- AchievementCard with certificate icon, title, issuer, completed date, grade, Share button.
- Bottom tab active Profile.

Logic:
- Share button uses native Share API with certificate URL.
- Settings gear opens SettingsScreen.
- Avatar opens EditProfileScreen later.
```

---

## 19. Screen 18 — Settings: Appearance, Calendar, Course Content

Source: `3281cb77-9e66-4e4f-b54d-2a38082182b2.jpg`

### 19.1 Ekran vazifasi

Settings screen continuation: theme mode, calendar sync, course download settings.

### 19.2 Appearance group

Rows:

```text
Dark Mode
Light Mode selected
Use Device Settings + description
```

Row specs:

```text
height:
  simple row: 72 dp
  row with description: 96–112 dp
paddingHorizontal: 24 dp
icon 30 dp
label 16/24 bold
description 14/20
selected check: right icon 28 dp primary
selected label color: primary
```

### 19.3 Calendar group

```text
Section title: CALENDAR
Row:
  Sync to my calendar
  description
  switch right
```

Switch:

```text
width 56
height 34
track off #E5E7EB
border #777
thumb #777
track on primary
thumb white
```

### 19.4 Course content group

Rows:

```text
Downloads
Download over Wi‑Fi only
Video download quality
```

Download row:

```text
navigation row with chevron
subtitle: Manage all of your offline content
```

Wi-Fi row:

```text
switch row
on blue
```

Quality row:

```text
value/subtitle: Always Ask
navigation or picker row
```

### 19.5 Integration in EduPath

Settings model:

```ts
type AppSettings = {
  appearance: "light" | "dark" | "system";
  syncCalendar: boolean;
  downloadWifiOnly: boolean;
  videoDownloadQuality: "always_ask" | "240p" | "360p" | "540p" | "720p";
};
```

### 19.6 Developer implementation prompt

```text
Extend SettingsScreen with Appearance, Calendar, and Course Content groups.

Requirements:
- Appearance uses selectable rows, not switches.
- Selected row has primary label and right check icon.
- Calendar sync uses switch.
- Downloads row navigates to DownloadsScreen.
- Wi-Fi only uses switch.
- Video download quality opens picker sheet.
- Store settings locally and sync to backend when logged in.
```

---

## 20. Screen 19 — Settings: Push Notifications + Language

Source: `ef973e1e-6b56-4335-96ea-5f793a973b63.jpg`

### 20.1 Ekran vazifasi

Course content settingsdan keyin push notification va language settings ko‘rsatiladi.

### 20.2 Push notifications group

Rows:

```text
Course-related
Study reminders
Promotions
```

Each row:

```text
height: 92–104 dp
paddingHorizontal: 24 dp
icon 30 dp
title 16/24 bold
description 14/20 gray
switch right 56×34
```

### 20.3 UX logic

```text
Course-related ON:
  notifications about course progress, deadlines, activity

Study reminders ON:
  enables reminder feature
  tap row or toggle opens StudyRemindersScreen if no schedule exists

Promotions:
  optional marketing notifications
```

### 20.4 Language group

Visible bottom:

```text
LANGUAGE section
Change Preferred Language
Automatic translations
```

Data:

```ts
type NotificationSettings = {
  courseRelated: boolean;
  studyReminders: boolean;
  promotions: boolean;
};
```

### 20.5 Developer implementation prompt

```text
Add PushNotificationsSettingsGroup.

Design:
- Section header "PUSH NOTIFICATIONS".
- Three SettingsSwitchRow components.
- Row height 96dp.
- Icon 30dp, title 16dp bold, subtitle 14dp gray.
- Switch right.

Logic:
- On first enable, request push notification permission.
- Course-related switch controls course activity notifications.
- Study reminders switch navigates to StudyRemindersScreen after enabling.
- Promotions switch controls marketing notifications.
```

---

## 21. Screen 20 — Logged-out Settings

Source: `f0a93b9d-634d-4e09-bda6-a4cc599bad41.jpg`

### 21.1 Ekran vazifasi

User login qilmagan holdagi settings. Account group login/signup CTA bilan boshlanadi, appearance va language sozlamalari ishlaydi.

### 21.2 Layout

```text
Top app bar
ACCOUNT section
Login/signup CTA
APPEARANCE section
LANGUAGE section
SUPPORT section partially visible
```

CTA:

```text
Text: Already have a Coursera account?
Button:
  marginTop: 16 dp
  height: 56 dp
  background primary
  borderRadius: 6 dp
  text white 16/24 bold
  icon 24
```

### 21.3 UX logic

```text
- Settings screen can be opened before login.
- Appearance and language are device-local settings.
- Account CTA navigates to Auth stack.
- Automatic translations can be stored locally before login.
- After login, local settings merge into user settings.
```

### 21.4 Developer implementation prompt

```text
Create GuestSettingsScreen or conditionally render SettingsScreen when user is not logged in.

Requirements:
- Show ACCOUNT section with login/signup CTA.
- Appearance selector works without account.
- Language selector works without account.
- Automatic translations switch works without account.
- Hide account-only rows like subscriptions and unlink Google.
- Login CTA navigates to /(auth)/login.
```

---
## 22. Screen 21 — Guest Auth Entry / Login or Sign Up

Source: `4576d7b4-8bcb-40cd-9f17-4702cf4f8f22.jpg`

### 22.1 Ekran vazifasi

Bu ekran guest user platformaga birinchi kirganda ko‘radigan auth entry. Asosiy maqsad: foydalanuvchini ro‘yxatdan o‘tishga majburlamasdan, lekin aniq CTA bilan login/signupga olib kirish.

EduPath’da bu ekran quyidagicha nomlanadi:

```text
AuthLandingScreen
Route: /(auth)/welcome
```

Bu ekran uchta UX qarorni hal qiladi:

```text
1. User hali tayyor bo‘lmasa, Sign up later orqali guest modega o‘tadi.
2. User tez kirishni xohlasa, Google/SSO/Email loginni tanlaydi.
3. Yangi user account yaratishga aniq primary CTA oladi.
```

Muhim: screenshotdagi Coursera logotipi va copy 1:1 olinmaydi. EduPath o‘z brand nomi, hero matni va original rang bloklari bilan ishlaydi.

---

### 22.2 Visual hierarchy

Ekran yuqoridan pastga quyidagicha qurilgan:

```text
Status bar
Top guest action: Sign Up Later
Blue brand hero block
Auth section title
Social auth row
Organization SSO button
Email login button
Divider with “or”
Primary signup button
Terms/privacy legal text
Bottom safe area
```

Userning ko‘zi avval hero brandga, keyin auth variantlarga, keyin primary signup button’ga tushadi. Bu juda yaxshi conversion layout, chunki userga bir nechta sign-in option beriladi, lekin asosiy biznes maqsad — account creation — primary button orqali ko‘proq urg‘u oladi.

---

### 22.3 Layout specs

Reference screen:

```text
Screenshot size: 591 × 1280 px
React Native base width: 393 dp
Horizontal page padding: 32 dp
```

Top link:

```text
Safe top: 24 dp
Top area height: 78 dp
Text: “Sign Up Later”
X: 32 dp
Y: 64–68 dp
Font size: 16 dp
Line height: 24 dp
Weight: 700
Color: primary
Tap area: min 44 × 44 dp
```

Hero block:

```text
Y: ~158 px screenshot ≈ 105 dp
Width: 100%
Height: 196–200 dp
Background: primaryDark / primary
Left decoration stripes:
  stripe1 width: 32 dp, color primaryLight
  stripe2 width: 32 dp, color primaryMid
  stripe3 width: 32 dp, color primaryDarkBorder
Content X: 130 dp approx
Content top: 46 dp
Logo font: 34–36 dp, weight 800, white
Hero copy font: 19–20 dp, lineHeight 32 dp, weight 700, white
```

EduPath variant hero copy:

```text
EduPath
Learn practical skills through guided video courses, quizzes, and real progress tracking.
```

Auth content:

```text
Section top margin after hero: 76 dp
Horizontal padding: 32 dp
Title font: 24 dp
Title weight: 700
Title color: textPrimary
Title bottom margin: 36 dp
```

Social buttons row:

```text
Row gap: 10–12 dp
Button height: 52 dp
Button flex: 1
Border width: 1 dp
Border color: borderStrong #8F96A3
Border radius: 8 dp
Background: white
Icon size: 24 dp
Text size: 16 dp
Text weight: 700
Text color: textSecondary
```

SSO button:

```text
Margin top: 18 dp
Height: 64 dp
Width: 100%
Border width: 1 dp
Border color: borderStrong
Radius: 8 dp
Icon size: 28 dp
Text size: 16 dp
Text weight: 700
Text align: center
Horizontal padding: 20 dp
```

Email login button:

```text
Margin top: 28 dp
Height: 56 dp
Border width: 1.2 dp
Border color: primary
Radius: 8 dp
Background: white
Text color: primary
Text size: 16 dp
Weight: 700
```

Divider:

```text
Margin top: 48 dp
Row height: 24 dp
Line height: 1 dp
Line color: divider
Text: “or”
Text size: 16 dp
Text color: textSecondary
Gap left/right around text: 14 dp
```

Signup primary button:

```text
Margin top: 32 dp
Height: 56 dp
Background: primary
Pressed background: primaryPressed
Radius: 8 dp
Text: white, 16 dp, weight 800
```

Legal text:

```text
Margin top: 68–72 dp
Font size: 15 dp
Line height: 22 dp
Color: textPrimary
Link color: primary
Link weight: 700
```

---

### 22.4 UX logic

```text
Sign Up Later:
  - Sets app mode = guest.
  - Navigates to /(tabs)/explore.
  - Guest can browse courses but cannot enroll, bookmark, take tests, or save progress.

Google:
  - Starts OAuth flow.
  - Backend verifies Google identity token.
  - If account exists, login.
  - If not exists, create student user by default or ask role selection.

Facebook:
  - Optional. For MVP, hide or replace with Apple on iOS.

Organization SSO:
  - Optional for MVP.
  - Can be disabled or shown as future feature.
  - In EduPath, this can become “Continue with school code”.

Log in with Email:
  - Navigates to login screen.

Create Account:
  - Navigates to signup screen.
```

Recommended EduPath MVP simplification:

```text
Show Google
Show Email login
Show Create account
Show Sign up later
Hide Facebook and SSO until backend is ready
```

---

### 22.5 Component decomposition

```text
AuthLandingScreen
  ├── GuestTopAction
  ├── AuthHeroBanner
  ├── AuthMethodButtonRow
  │   ├── SocialAuthButton Google
  │   └── SocialAuthButton Apple/Facebook optional
  ├── SsoButton
  ├── OutlineButton Email
  ├── OrDivider
  ├── PrimaryButton Signup
  └── LegalTextLinks
```

---

### 22.6 Data and state

```ts
type AuthEntryAction =
  | "guest"
  | "google"
  | "facebook"
  | "apple"
  | "sso"
  | "email-login"
  | "email-signup";

type GuestSession = {
  mode: "guest";
  startedAt: string;
  preferredLanguage: "en" | "ja";
};
```

Guest restrictions:

```ts
export function requiresAuth(action: string) {
  return [
    "enroll_course",
    "buy_course",
    "bookmark_course",
    "save_note",
    "submit_quiz",
    "answer_timed_question",
    "track_progress"
  ].includes(action);
}
```

---

### 22.7 Designer prompt

```text
Design an EduPath mobile auth entry screen inspired by a premium learning app.
Use a white background, a top text action “Continue as guest”, and a large blue branded hero block.
Hero must not copy Coursera brand. Use EduPath logo, original copy, and simple geometric stripes.
Below hero, create a “Log in or Sign up” section with Google, Email Login, and Create Account CTAs.
Use 32dp horizontal padding, 56dp primary buttons, 8dp radius, clean black typography, and strong blue CTA color.
Legal text should be readable and links should use the primary blue.
```

### 22.8 Developer prompt

```text
Create AuthLandingScreen in Expo React Native.
Use SafeAreaView and ScrollView.
Implement GuestTopAction, AuthHeroBanner, SocialAuthButton, OutlineButton, OrDivider, PrimaryButton, and LegalText.
The screen must support English/Japanese text through i18n.
On “Continue as guest”, store guest mode in Redux and navigate to /(tabs)/explore.
On Google, call authApi.googleLogin.
On Email login, navigate to /(auth)/login.
On Create Account, navigate to /(auth)/signup.
All buttons must have minimum 44dp tap area, loading state, disabled state, and accessibility labels.
```

---

## 23. Screen 22 — Explore: Most Popular Courses List

Source: `88a9f9f7-59af-4d18-8674-1426840c478f.jpg`

### 23.1 Ekran vazifasi

Explore tab userga platformadagi mashhur kurslarni ko‘rsatadi. Bu discovery screen. Maqsad userni course detailga olib kirish.

EduPath route:

```text
/(tabs)/explore
```

Bu screen logged-out va logged-in user uchun bir xil ishlashi mumkin, faqat actionlar farq qiladi:

```text
Guest: view course detail, preview only
Student: enroll, bookmark, buy, continue
Teacher: browse but course creation dashboard separate
```

---

### 23.2 Visual hierarchy

```text
Status bar
Centered page title: Explore
Section title row: Most Popular Courses + See All
Vertical course list
Next section header: Prepare for Industry Certification Exams
Bottom tab bar
```

Bunda course card ko‘rinishi minimal: katta card emas, balki list item. Coursera bu yerda image’ni o‘ngga qo‘yadi, chunki mobile listda title va rating muhimroq.

---

### 23.3 Layout specs

Page:

```text
Background: white
Horizontal padding: 24 dp
Top safe area: 24 dp
Page title Y: 66 dp
Page title font: 24 dp
Page title weight: 800
Text align: center
```

Section header:

```text
Top margin from title: 74 dp
Height: 40 dp
Title: 28 dp, weight 800, color textPrimary
See All: 20 dp, weight 400/500, color textPrimary
Row align center
```

Popular course list item:

```text
Container height: 114–124 dp
Padding vertical: 14 dp
Image: 56–64 dp square on right
Image radius: 6 dp
Text area width: available - image - 24 dp
Title font: 20 dp
Title lineHeight: 26 dp
Title max lines: 2
Provider font: 17 dp, color textSecondary
Type font: 17 dp, color textSecondary
Rating row marginTop: 6 dp
Star size: 16 dp
Rating text: 16 dp, color textSecondary
```

Screenshotda har itemda divider yo‘q, lekin whitespace bilan ajratilgan. EduPath’da list readability uchun optional `marginBottom: 26dp` yetarli.

Bottom tab:

```text
Height: 78 dp + safe bottom
Border top: 1 dp #E5E7EB
Selected item: pill background #EFE5FF
Pill width: 72 dp
Pill height: 44 dp
Icon size: 28 dp
Label font: 15 dp
```

---

### 23.4 Course list data

```ts
type ExploreCourseItem = {
  id: string;
  title: LocalizedText;
  providerName: string;
  type: "course" | "professional_certificate" | "specialization";
  ratingAvg: number;
  ratingCount: number;
  thumbnailUrl?: string;
  isMobileFocused?: boolean;
  categoryId: string;
};
```

Rating display helper:

```ts
function formatRatingCount(count: number) {
  if (count >= 1000) return `${Math.round(count / 1000)}k`;
  return String(count);
}
```

---

### 23.5 UX logic

```text
Tap course row:
  -> /course/[courseId]

Tap See All:
  -> /explore/section/popular

If thumbnail missing:
  -> show generated course placeholder icon, not blank gray block.

If guest taps enroll/bookmark in detail:
  -> auth required bottom sheet.
```

---

### 23.6 Component decomposition

```text
ExploreScreen
  ├── PageTitle
  ├── ExploreSectionHeader
  ├── CompactCourseList
  │   └── CompactCourseRow
  ├── HorizontalCourseSection optional
  └── AppBottomTabs
```

---

### 23.7 Designer prompt

```text
Design a mobile Explore screen for EduPath.
Use a centered “Explore” page title, then a “Most Popular Courses” section with See All on the right.
Course rows should prioritize title, provider, type, rating, and a small thumbnail aligned right.
Use 24dp horizontal padding, 20dp course title font, 16–17dp metadata, 64dp thumbnail, generous vertical whitespace, and no heavy card borders.
Bottom navigation must have 5 tabs with a soft purple selected pill.
```

### 23.8 Developer prompt

```text
Create ExploreScreen with FlatList or ScrollView sections.
Implement ExploreSectionHeader and CompactCourseRow.
CompactCourseRow must support missing thumbnails, max 2 title lines, rating display, and course type labels.
Use i18n for static labels and tData for course title.
Clicking a row navigates to course detail.
See All navigates to filtered course list.
Support guest mode without blocking browse.
```

---

## 24. Screen 23 — Learn Tab Empty State

Source: `8c02468b-27ca-48c5-ade5-7f837da2cf93.jpg`

### 24.1 Ekran vazifasi

User hali hech qanday kursga enroll qilmagan bo‘lsa Learn tab bo‘sh qolmasligi kerak. Empty state userga nima qilish kerakligini aytadi: kursga yozilish.

EduPath route:

```text
/(tabs)/learn
```

State:

```text
No active enrollments
```

---

### 24.2 Visual hierarchy

```text
Status bar
Settings gear top-right
Centered illustration
Main message
Helper message
Primary CTA: Explore courses
Bottom tab bar
```

Bu screen juda toza: userda faqat bitta action bor. Bu yaxshi UX, chunki empty stateda ko‘p variant chalg‘itadi.

---

### 24.3 Layout specs

Top:

```text
Status bar: 24 dp
Gear icon:
  top: 62–68 dp
  right: 32 dp
  size: 28 dp
  tap area: 44 dp
```

Empty content:

```text
Container: flex 1, centered vertically but slightly above center
Content top approx: 230 dp
Horizontal padding: 40 dp
Illustration size: 128 × 110 dp
Illustration marginBottom: 42 dp
Title max width: 310 dp
Title font: 26–27 dp
Title lineHeight: 34 dp
Title weight: 800
Title align: center
Subtitle marginTop: 26 dp
Subtitle font: 16 dp
Subtitle lineHeight: 24 dp
Subtitle color: textSecondary
Subtitle align: center
Button marginTop: 38 dp
Button width: 270 dp
Button height: 56 dp
Button radius: 8 dp
```

Bottom tabs:

```text
Learn tab selected
Selected pill width: 76 dp
Selected pill background: accentPurpleSoft
Icon active primary
Label active primary
```

---

### 24.4 UX logic

```text
If user has no enrollments:
  render LearnEmptyState

If user has enrollments:
  render LearnHome with goals and course cards

CTA Explore courses:
  navigate to /(tabs)/explore

Gear:
  navigate to /settings
```

Guest user variant:

```text
If guest opens Learn:
  show same empty state, but CTA says “Explore courses”.
  Do not force login until user tries to enroll.
```

---

### 24.5 Component decomposition

```text
LearnScreen
  ├── SettingsIconButton
  ├── LearnEmptyState OR LearnDashboardContent
  └── AppBottomTabs

LearnEmptyState
  ├── Illustration
  ├── Title
  ├── Subtitle
  └── PrimaryButton
```

---

### 24.6 Designer prompt

```text
Design an empty Learn tab for EduPath.
Use a white background with a settings gear in the top-right.
Center an original simple line illustration, bold title “Enroll in a course to view your progress”, supporting text, and a single blue primary CTA.
Keep it calm, spacious, and motivational.
Use 40dp side padding, 26dp title font, 16dp subtitle, 56dp primary button, and large whitespace.
```

### 24.7 Developer prompt

```text
Create LearnScreen that checks enrollment count.
If count is zero, render LearnEmptyState.
LearnEmptyState must accept title, subtitle, ctaLabel, onPress, and illustration props.
Use AppBottomTabs with Learn selected.
Settings gear opens SettingsScreen.
Add accessibility label for the CTA and gear.
```

---

## 25. Screen 24 — Search Home + Popular Searches

Source: `194d6c50-a268-4c4f-8ddf-8195892862d3.jpg`

### 25.1 Ekran vazifasi

Search screen userga qidiruvni boshlash uchun katta input va popular search suggestions beradi. Bu ekranda qidiruv hali bajarilmagan, shuning uchun result list yo‘q.

EduPath route:

```text
/(tabs)/search
```

---

### 25.2 Visual hierarchy

```text
Status bar
Large page title: Search
Search input box
Popular Searches section title
Suggestion rows
Bottom tab bar
```

Bu screen’da title juda katta. Bu Coursera mobile UX’da top-level tab page ekanini bildiradi. EduPath’da ham top-level tab screenlar uchun bir xil title style ishlatish kerak.

---

### 25.3 Layout specs

Page:

```text
Background: white
Horizontal padding: 26 dp
Top padding after status: 42 dp
Title font: 40 dp
Title lineHeight: 48 dp
Title weight: 800
Title color: textPrimary
```

Search input:

```text
Margin top: 40 dp
Height: 62 dp
Width: 100%
Border width: 1 dp
Border color: #2F3337
Border radius: 4–6 dp
Background: white
Padding horizontal: 20 dp
Icon size: 28 dp
Icon color: textPrimary
Icon/text gap: 20 dp
Placeholder font: 16 dp
Placeholder color: textPrimary
```

Popular searches title:

```text
Margin top: 76 dp
Font size: 28 dp
Line height: 34 dp
Weight: 800
Color: textPrimary
```

Suggestion row:

```text
Height: 72 dp
Icon left: 20–22 dp
Icon color: #B8BDC5
Text marginLeft: 28 dp
Text font: 22 dp
Text lineHeight: 28 dp
Text color: textPrimary
Divider height: 1 dp
Divider color: divider
Divider starts after icon area: x 52 dp
```

Bottom tab:

```text
Search selected
Pill width: 76 dp
Search icon size: 30 dp
```

---

### 25.4 Search behavior

```text
On input focus:
  - Keep same screen.
  - Show keyboard.
  - Optional: show recent searches if user has history.

On submit:
  - Navigate to /search/results?q=query
  - Save query to recent searches.
  - Fetch courses, teachers, topics.

On popular search tap:
  - Fill query.
  - Navigate to results immediately.
```

Search should cover:

```text
course.title
author/teacher.name
category.name
skills
course.description
```

---

### 25.5 Data model

```ts
type SearchSuggestion = {
  id: string;
  label: string;
  type: "popular" | "recent" | "topic";
  locale: "en" | "ja";
  orderIndex: number;
};

type SearchResult = {
  id: string;
  type: "course" | "teacher" | "category";
  title: string;
  subtitle?: string;
  imageUrl?: string;
};
```

---

### 25.6 Component decomposition

```text
SearchScreen
  ├── LargePageTitle
  ├── SearchInputBox
  ├── SearchSuggestionSection
  │   └── SearchSuggestionRow
  └── AppBottomTabs
```

---

### 25.7 Designer prompt

```text
Design a clean EduPath Search tab.
Use a large 40dp “Search” heading, a rectangular bordered search input with search icon, and a Popular Searches list with thin dividers.
Each suggestion row uses a light gray arrow/trending icon, 22dp text, and 72dp row height.
Keep the page white, spacious, and optimized for touch.
Bottom tab should highlight Search with a soft purple pill.
```

### 25.8 Developer prompt

```text
Create SearchScreen.
Implement SearchInputBox with controlled text, submit handler, clear optional, and keyboard returnKeyType="search".
Render popular suggestions from mock/API data.
On suggestion press, navigate to SearchResultsScreen with query param.
Store recent searches locally for logged-in and guest users.
Add debounced search later, but for MVP run search on submit.
```

---

## 26. Screen 25 — Profile Empty State

Source: `a53784f6-d94e-42dc-bdfc-d8807ded5571.jpg`

### 26.1 Ekran vazifasi

Profile tab userning completed courses, certificates, achievements va personal data’sini ko‘rsatadi. Hali achievement bo‘lmasa empty state ko‘rinadi.

EduPath route:

```text
/(tabs)/profile
```

---

### 26.2 Visual hierarchy

```text
Status bar
Settings gear top-right
Large title: Profile
Centered certificate illustration
Motivational title
Subtitle
Primary CTA
Bottom tab bar
```

Bu screen ham Learn empty statega o‘xshaydi, lekin context boshqa: completion va certificate. Consistency uchun bitta `EmptyState` component reuse qilinadi.

---

### 26.3 Layout specs

Top:

```text
Background: white
Horizontal padding: 28 dp
Gear icon:
  top: 62 dp
  right: 32 dp
  size: 28 dp
Large title:
  top: 158 dp
  x: 28 dp
  font: 40 dp
  lineHeight: 48 dp
  weight: 800
```

Empty content:

```text
Content top: 265–285 dp
Illustration size: 150 × 112 dp
Illustration marginBottom: 44 dp
Title max width: 330 dp
Title font: 26 dp
Title lineHeight: 34 dp
Title weight: 800
Title align: center
Subtitle marginTop: 30 dp
Subtitle font: 16 dp
Subtitle lineHeight: 24 dp
Subtitle color: textSecondary
CTA marginTop: 38 dp
CTA width: 272 dp
CTA height: 56 dp
CTA radius: 8 dp
```

---

### 26.4 UX logic

```text
If user logged out:
  - Show profile empty state but CTA says “Log in to view profile”.

If logged in and achievements empty:
  - Show this state.
  - CTA navigates to Explore or Learn depending on enrollments.

If achievements exist:
  - Show Profile header, avatar, achievements cards, certificates, share buttons.
```

CTA decision:

```ts
function getProfileEmptyCta(user: User | null, enrollmentCount: number) {
  if (!user) return { label: "Log in", route: "/(auth)/login" };
  if (enrollmentCount > 0) return { label: "Continue learning", route: "/(tabs)/learn" };
  return { label: "Start learning now", route: "/(tabs)/explore" };
}
```

---

### 26.5 Component decomposition

```text
ProfileScreen
  ├── SettingsIconButton
  ├── LargePageTitle
  ├── ProfileEmptyState OR ProfileContent
  └── AppBottomTabs
```

---

### 26.6 Designer prompt

```text
Design an EduPath Profile empty state.
Use a large “Profile” heading, top-right settings icon, original certificate illustration, bold motivational copy, gray helper text, and a single blue CTA.
The empty state should feel encouraging, not like an error.
Use the same spacing system as the Learn empty state.
```

### 26.7 Developer prompt

```text
Create ProfileScreen with conditional rendering.
If no achievements, render EmptyState with certificate illustration.
CTA route changes based on auth and enrollment state.
If achievements exist, render achievement cards from user profile data.
Settings gear opens SettingsScreen.
Make bottom tab selected state Profile.
```

---

## 27. Screen 26 — Explore: Topics, Plus Banner, Mobile Focused Cards

Source: `459660a1-7b06-4f7c-a5eb-0a30529cc1b9.jpg`

### 27.1 Ekran vazifasi

Bu Explore screenning yuqori qismi. User course discovery’ni topics, promo banner va horizontal course cards orqali boshlaydi.

EduPath’da bu screen Explore home’ning asosiy layoutini beradi:

```text
Large title
Topic chips
Subscription/promo banner
Horizontal course sections
Bottom tab
```

---

### 27.2 Visual hierarchy

```text
Status bar
Large title: Explore
Topics section header + See All
Horizontal topic chips
Promo subscription banner
Mobile Focused section header + See All
Two-column/horizontal course cards
Bottom tab bar
```

Bu screenshot oldingi Explore Popular screen bilan birgalikda bitta Explore page’ni tashkil qiladi. Yuqori qism card/grid discovery, pastroqda popular list bo‘lishi mumkin.

---

### 27.3 Layout specs

Page:

```text
Background: white
Horizontal padding: 26 dp
Top title Y: 160 dp screenshot area ≈ 106 dp after status if no centered header
Title font: 40 dp
Title weight: 800
Title lineHeight: 48 dp
```

Section header:

```text
Margin top after title: 24 dp
Height: 38 dp
Title font: 28 dp
Weight: 800
See All font: 22 dp
See All color: textPrimary
```

Topic chips row:

```text
Margin top: 22 dp
Horizontal ScrollView
Gap: 12 dp
Chip height: 52 dp
Chip min width: 130 dp
Border width: 1 dp
Border color: #A1A6AE
Radius: 8 dp
Padding horizontal: 18 dp
Icon size: 26–28 dp
Icon/text gap: 12 dp
Text font: 17–18 dp
Text weight: 800
Text color: textPrimary
```

Promo banner:

```text
Margin top: 52 dp
Width: 100%
Height: 88–92 dp
Background: #F0F7FF
Border width: 1 dp
Border color: #BBD2E6
Radius: 8 dp
Padding horizontal: 18 dp
Padding vertical: 18 dp
Left content width: ~175 dp
Right button width: 144 dp
Right button height: 44 dp
Button border: 1 dp primary/soft blue
Button radius: 8 dp
Button text: primary, 16 dp, weight 700
```

EduPath variant:

```text
EduPath Plus
All courses, one simple plan
[Learn more]
```

Mobile Focused course cards:

```text
Section top margin: 48 dp
Two cards visible per row
Card width: 173 dp
Image height: 122 dp
Image radius: 8 dp
Card gap: 14 dp
Title marginTop: 14 dp
Title font: 19 dp
Title lineHeight: 24 dp
Title maxLines: 2
Provider font: 17 dp, color textSecondary
Type font: 17 dp, color textSecondary
Rating marginTop: 8 dp
Star size: 16 dp
Rating text: 16 dp
```

Bottom tab:

```text
Explore selected
Same tab bar as other screenshots
```

---

### 27.4 UX logic

```text
Topic chip press:
  -> /explore/topic/[topicId]

See All topics:
  -> /explore/topics

Promo banner button:
  -> /subscription or /plans

Course card press:
  -> /course/[courseId]

Horizontal cards:
  - Can be FlatList horizontal.
  - Snap optional.
```

For EduPath MVP, subscription banner can be used for:

```text
EduPath Plus
Premium courses
Teacher-led programs
Exam prep bundle
```

Agar payment hali tayyor bo‘lmasa:

```text
Banner can route to “Coming soon” modal or hidden behind feature flag.
```

---

### 27.5 Data model

```ts
type ExploreTopic = {
  id: string;
  title: LocalizedText;
  iconName: string;
  orderIndex: number;
};

type PromoBanner = {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  targetRoute: string;
  enabled: boolean;
};

type ExploreSection = {
  id: string;
  title: LocalizedText;
  layout: "compact_list" | "horizontal_cards" | "topic_chips";
  courseIds?: string[];
  topicIds?: string[];
};
```

---

### 27.6 Component decomposition

```text
ExploreScreen
  ├── LargePageTitle
  ├── TopicsRail
  │   └── TopicChip
  ├── PromoBannerCard
  ├── CourseRailSection
  │   └── CoursePosterCard
  ├── CompactCourseListSection
  └── AppBottomTabs
```

---

### 27.7 Designer prompt

```text
Design an EduPath Explore home screen.
Use a large bold Explore title, a Topics row with bordered chips, a soft blue EduPath Plus promo banner, and a Mobile Focused course card section.
Cards should be image-led, two visible per row, with title, provider, type, and rating.
Use 26dp side padding, 52dp chip height, 90dp banner height, 173dp card width, 122dp image height, and 8dp radius.
Keep the visual style clean, white, and premium.
```

### 27.8 Developer prompt

```text
Extend ExploreScreen to include TopicsRail, PromoBannerCard, and CourseRailSection above the popular courses list.
Use horizontal FlatList for topics and course rail.
Use feature flag for PromoBannerCard if subscription is not implemented.
Use CoursePosterCard for image-led cards and CompactCourseRow for popular list rows.
All text must use i18n or localized data fallback.
```

---

## 28. Unified cross-screen navigation model

### 28.1 Main mobile tabs

Coursera mobile screenshotlarida asosiy bottom tabs:

```text
Explore
Career
Learn
Search
Profile
```

EduPath uchun tavsiya:

```text
Explore
Courses / Career
Learn
Search
Profile
```

Agar platforma asosan kurs marketplace bo‘lsa:

```text
Explore
Programs
Learn
Search
Profile
```

Agar career path feature hali yo‘q bo‘lsa, MVP’da `Career` o‘rniga `Courses` ishlatish ma’qul.

### 28.2 Tab behavior

```text
Explore:
  Public browsing, topics, popular courses, recommended courses.

Courses/Programs:
  Career paths, certificates, bundles, categories.

Learn:
  Student enrolled courses, goals, progress, up next.

Search:
  Search input, popular/recent searches, results.

Profile:
  User profile, achievements, certificates, account access.
```

### 28.3 Bottom tab specs

```text
Height: 72 dp + safe area
Background: white
Top border: 1 dp #E5E7EB
Item width: screenWidth / 5
Icon size: 27–30 dp
Label font: 14–15 dp
Label top margin: 4 dp
Inactive color: #5F6673
Active color: primary
Active icon pill:
  width: 72–78 dp
  height: 44 dp
  radius: 22 dp
  background: accentPurpleSoft
```

Interaction:

```text
- Tap active tab: scroll to top.
- Long press optional: no action.
- Badge optional for reminders/deadlines.
```

---

## 29. Unified screen list for EduPath MVP

After all 26 screenshots, mobile app should contain these student-facing screens:

```text
AuthLandingScreen
LoginScreen
SignupScreen
OtpVerificationScreen
ForgotPasswordScreen

ExploreScreen
ExploreSeeAllScreen
TopicCoursesScreen
CourseDetailScreen

LearnScreen
CourseDashboardScreen
CourseGradesScreen
CourseForumsScreen optional
CourseNotesScreen
CourseResourcesScreen
CourseInfoScreen
LessonPlayerScreen
StudyRemindersScreen

SearchScreen
SearchResultsScreen

ProfileScreen
SettingsScreen
DownloadsScreen
LanguageSettingsScreen
NotificationSettingsScreen
```

Teacher/Parent/Admin screens are separate and can reuse the same design system.

---

## 30. Data additions needed for EduPath

### 30.1 Student learning data

```ts
type LearningGoal = {
  id: string;
  userId: string;
  type: "lessons" | "readings" | "practice_items";
  targetCount: number;
  completedCount: number;
  period: "daily" | "weekly";
};

type WeeklyActivity = {
  userId: string;
  weekStart: string;
  activeDays: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
  targetDays: number;
};
```

### 30.2 Course dashboard data

```ts
type CourseDashboard = {
  courseId: string;
  activeModuleId: string;
  moduleProgressPercent: number;
  courseProgressPercent: number;
  assignmentDueCount: number;
  downloadableSizeMb?: number;
  upNextLessonId?: string;
  sections: Section[];
  lessons: Lesson[];
};
```

### 30.3 Notes and transcript

```ts
type TranscriptSegment = {
  id: string;
  lessonId: string;
  startSec: number;
  endSec: number;
  text: LocalizedText;
};

type LessonNote = {
  id: string;
  userId: string;
  lessonId: string;
  startSec: number;
  endSec?: number;
  text: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 30.4 Study reminders

```ts
type StudyReminder = {
  id: string;
  userId: string;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  enabled: boolean;
  time?: string;
  timezone: string;
  notificationId?: string;
};
```

### 30.5 Settings

```ts
type UserSettings = {
  userId?: string;
  theme: "light" | "dark" | "system";
  preferredLanguage: "en" | "ja";
  automaticTranslations: boolean;
  downloadOverWifiOnly: boolean;
  videoDownloadQuality: "always_ask" | "240p" | "360p" | "540p" | "720p";
  courseNotificationsEnabled: boolean;
  studyRemindersEnabled: boolean;
  promotionsEnabled: boolean;
  syncCalendarEnabled: boolean;
};
```

### 30.6 Explore and search data

```ts
type ExploreHome = {
  topics: ExploreTopic[];
  promoBanners: PromoBanner[];
  sections: ExploreSection[];
};

type SearchState = {
  query: string;
  recentSearches: string[];
  popularSearches: SearchSuggestion[];
};
```

### 30.7 Auth/guest data

```ts
type AppSession =
  | { type: "guest"; startedAt: string; preferredLanguage: "en" | "ja" }
  | { type: "authenticated"; user: User; accessToken: string };
```

---

## 31. API endpoints to add

Auth:

```http
POST /auth/signup
POST /auth/login
POST /auth/google
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/forgot-password
POST /auth/logout
GET  /auth/me
```

Explore/search:

```http
GET /explore/home
GET /explore/topics
GET /explore/topics/:topicId/courses
GET /courses/popular
GET /courses/mobile-focused
GET /search/suggestions
GET /search?q=python
POST /search/recent
DELETE /search/recent
```

Student learning:

```http
GET /students/me/learn
GET /courses/:courseId/dashboard
GET /courses/:courseId/grades
GET /courses/:courseId/notes
GET /courses/:courseId/resources
GET /courses/:courseId/info
GET /lessons/:lessonId
GET /lessons/:lessonId/transcript
GET /lessons/:lessonId/notes
POST /lessons/:lessonId/notes
PATCH /notes/:noteId
DELETE /notes/:noteId
```

Settings/reminders:

```http
GET /users/me/settings
PATCH /users/me/settings
GET /users/me/study-reminders
PUT /users/me/study-reminders
POST /users/me/study-reminders/reset
```

Profile:

```http
GET /users/me/profile
GET /users/me/achievements
GET /users/me/certificates
```

---

## 32. React Native component specs

### 32.1 Base components

```text
AppText
AppButton
AppIconButton
AppCard
AppDivider
AppSwitch
AppBottomSheet
EmptyState
SettingsRow
```

PrimaryButton:

```text
Height: 56 dp
Border radius: 8 dp
Padding horizontal: 20 dp
Background: primary
Pressed: primaryPressed
Disabled: #A7B7D9
Text: white, 16 dp, weight 800
Loading spinner centered
```

OutlineButton:

```text
Height: 52–56 dp
Border: 1 dp primary or borderStrong
Radius: 8 dp
Background: white
Text: primary or textPrimary
```

AppCard:

```text
Background: white
Border: 1 dp borderLight or none
Radius: 10–12 dp
Shadow iOS: 0 2 8 rgba(0,0,0,0.12)
Elevation Android: 2
Padding: 16–24 dp
```

---

### 32.2 Navigation components

AppBottomTabs:

```text
Props:
- activeTab
- onTabPress
- items: { key, label, icon }

Layout:
- position bottom for native tab navigator
- white background
- top border
- active icon pill
```

CourseTopHeader:

```text
Height: 110–120 dp including safe area
Left back icon
Provider small label
Course title max 2 lines
Right reminder icon
Right more icon
```

CourseTabBar:

```text
Horizontal scrollable if more than 4 tabs
Tab height: 48 dp
Label font: 18 dp bold
Active underline: 3 dp black
```

---

### 32.3 Explore components

TopicChip:

```text
Height: 52 dp
Border: 1 dp #A1A6AE
Radius: 8 dp
PaddingX: 18 dp
Gap: 12 dp
Icon: 26 dp
Text: 17–18 dp, 800
```

PromoBannerCard:

```text
Height: 90 dp
Radius: 8 dp
Border: 1 dp #BBD2E6
Background: #F0F7FF
Padding: 18 dp
CTA button: 144 × 44 dp
```

CoursePosterCard:

```text
Width: 173 dp
Image: 173 × 122 dp
Image radius: 8 dp
Title: 19 dp, max 2 lines
Meta: 17 dp gray
Rating: 16 dp
```

CompactCourseRow:

```text
Min height: 114 dp
Thumbnail: 64 × 64 dp
Title: 20 dp, max 2 lines
Provider/type/rating: 16–17 dp
```

---

### 32.4 Learning components

LessonPlayerScreen shell:

```text
Video area height: 220–260 dp portrait
Title block padding: 24 dp
Tabs height: 56 dp
Bottom action bar height: 72 dp
Back/Note/Next buttons height: 48 dp
```

TranscriptPanel:

```text
Row paddingX: 24 dp
Timestamp width: 52 dp
Text flex: 1
Active segment color: primary
Row marginBottom: 24 dp
```

NoteCard:

```text
Thumbnail: 142 × 82 dp
Timestamp badge bottom right
Text font: 16 dp
Show more link primary
Edit icon 28 dp
```

VideoOptionsSheet:

```text
Bottom sheet radius top: 24 dp
Handle optional
Row height: 72 dp
Icon 28 dp
Title 16–17 dp bold
Value right 16 dp gray
```

---

## 33. Implementation roadmap for all mobile screenshots

### Milestone A — Design system foundation

```text
1. Add tokens: colors, spacing, radius, typography.
2. Build AppButton, AppText, AppCard, AppDivider, AppIconButton.
3. Build AppBottomTabs with selected pill.
4. Build EmptyState reusable component.
5. Build SettingsRow and SettingsSwitchRow.
```

### Milestone B — Public discovery and auth

```text
1. AuthLandingScreen.
2. ExploreScreen with topics, promo banner, course rails, popular list.
3. SearchScreen with suggestions.
4. ProfileEmptyState for guest/no achievement.
5. LearnEmptyState for no enrollment.
```

### Milestone C — Student learning dashboard

```text
1. LearnHome with goals and weekly activity.
2. EnrolledCourseCard and UpNext card.
3. CourseDashboardScreen with module selector and lesson cards.
4. CourseGradesScreen.
5. CourseResourcesScreen.
6. CourseInfoScreen.
7. CourseNotesScreen.
```

### Milestone D — Lesson player

```text
1. Video player shell.
2. Transcript tab.
3. Notes tab.
4. Summary empty state.
5. Bottom Back/Note/Next bar.
6. Video options bottom sheet.
7. Timed question modal.
8. Progress tracking.
```

### Milestone E — Settings and reminders

```text
1. Settings screen logged-out.
2. Settings screen logged-in.
3. Appearance settings.
4. Download settings.
5. Push notification settings.
6. Study reminders screen.
7. Language settings.
```

---

## 34. Master Cursor / IDE prompt

Quyidagi promptni IDE assistant yoki Cursor’ga berish mumkin:

```text
You are a senior React Native + Expo engineer and senior mobile UI/UX implementer.
Build EduPath LMS mobile UI based on the provided MD specification.
Do not copy Coursera branding, logo, exact copy, or proprietary assets.
Use the same UX patterns but original EduPath design tokens.

Tech stack:
- Expo React Native
- TypeScript
- Expo Router
- Redux Toolkit
- RTK Query
- i18next
- expo-video later for lesson player

First implement:
1. Design tokens: colors, spacing, radius, typography.
2. Base components: AppText, AppButton, AppIconButton, AppCard, AppDivider, EmptyState.
3. Bottom tab navigator with tabs: Explore, Courses, Learn, Search, Profile.
4. AuthLandingScreen with guest mode, Google/email/signup CTAs.
5. ExploreScreen with LargePageTitle, TopicsRail, PromoBannerCard, CourseRailSection, CompactCourseList.
6. SearchScreen with search input and popular suggestions.
7. LearnScreen with empty state and enrolled-state switch.
8. ProfileScreen with empty state and achievements-state switch.
9. SettingsScreen rows and StudyRemindersScreen.
10. CourseDashboardScreen and LessonPlayerScreen shell.

Follow exact layout guidelines:
- Base screen width 393dp.
- Main horizontal padding 24–26dp, auth screen 32dp.
- Primary buttons height 56dp, radius 8dp.
- Top-level page titles 40dp bold.
- Section titles 28dp bold.
- Body text 16–17dp.
- Course title rows 20dp.
- Bottom tab bar height 72dp plus safe area.
- Active tab uses soft purple pill.

Every component must:
- Be typed with TypeScript.
- Use theme tokens, no hardcoded random colors.
- Support English/Japanese i18n.
- Have accessible labels.
- Have loading/empty/error states where needed.
```

---

## 35. QA checklist

### 35.1 Visual QA

```text
[ ] All 26 referenced screen patterns are represented.
[ ] No Coursera logo/name remains in final EduPath UI.
[ ] Buttons are at least 44dp touch target.
[ ] Primary buttons are 56dp tall.
[ ] Horizontal padding is consistent.
[ ] Bottom tabs selected pill matches across Explore/Learn/Search/Profile.
[ ] Empty states have one clear CTA.
[ ] Settings rows align icons, labels, subtitles, switches.
[ ] Course tabs underline active tab clearly.
[ ] Video player tabs remain readable under video.
```

### 35.2 UX QA

```text
[ ] Guest can browse Explore and Search.
[ ] Guest is prompted to login only when trying protected actions.
[ ] Learn empty state routes to Explore.
[ ] Profile empty state routes based on auth/enrollment.
[ ] Search suggestions navigate to results.
[ ] Course row/card opens course detail.
[ ] Settings gear opens Settings.
[ ] Study reminders toggles request notification permission.
[ ] Video settings sheet closes by tapping outside and Close/back gesture.
[ ] Course options sheet includes language, preferred language, unenroll.
```

### 35.3 Engineering QA

```text
[ ] Components use theme tokens only.
[ ] TypeScript has no implicit any.
[ ] Routes are typed or centralized.
[ ] Mock data is separated from UI.
[ ] i18n keys exist for English/Japanese.
[ ] All lists have stable keys.
[ ] Long course titles clamp correctly.
[ ] Missing thumbnails show placeholders.
[ ] SafeAreaView works on Android/iOS.
[ ] Web layout does not break at mobile width.
```

---

## 36. What to implement first

Eng to‘g‘ri first sprint:

```text
1. Bottom tab shell
2. Explore screen
3. Search screen
4. Auth landing
5. Learn empty + Learn dashboard mock
6. Profile empty + Profile achievements mock
7. Settings + Study Reminders
8. Course dashboard
9. Lesson player shell
```

Sabab: bu tartibda siz avval asosiy mobile app navigation va student discovery flow’ni ko‘rasiz. Keyin learning flowga o‘tasiz.

---

## 37. Final unified integration summary

Bu 26 screenshotdan EduPath loyihamizga quyidagi katta mobile UX patternlar olinadi:

```text
- Guest auth entry and account conversion flow
- Public course discovery via Explore
- Topics, course rails, popular course list
- Search with popular suggestions
- Empty Learn state for no enrollments
- Learn dashboard with goals and enrolled courses
- Course dashboard with modules, progress and up-next lesson
- Course internal tabs: Dashboard, Grades, Forums, Notes, Resources, Info
- Lesson video workspace with Transcript, Notes, Summary
- Video settings bottom sheet
- Course options bottom sheet
- Study reminders and notification scheduling
- Settings system: appearance, downloads, notifications, language, account
- Profile empty state and achievements/certificates state
- Bottom tab navigation across the whole mobile app
```

Unified mobile flow:

```text
Guest opens app
→ AuthLandingScreen
→ Continue as guest or login/signup
→ Explore courses
→ Search or browse topics
→ Course detail
→ Enroll/buy/login required
→ Learn dashboard
→ Course dashboard
→ Lesson player
→ Transcript / Notes / Summary
→ Timed question
→ Section final quiz
→ Progress updates Learn and Profile
→ Settings/reminders keep student engaged
```

Implementation rule:

```text
Do not copy Coursera brand.
Copy only the proven UX patterns:
- clear hierarchy
- simple cards
- progress visibility
- contextual bottom sheets
- helpful empty states
- accessible mobile navigation
```
