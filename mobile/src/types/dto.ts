/**
 * Shared Data Transfer Objects (DTO).
 *
 * Bu tiplar mock data va kelajakdagi real `/api/mobile/*` javoblari uchun
 * BITTA shartnoma (contract). Manba: DATABASE_AND_API_PLAN.md §4.2.
 *
 * MUHIM xavfsizlik qoidasi:
 *   - `correctOptionId` HECH QACHON savol DTO'siga kirmaydi (test yechilmaguncha).
 *   - Baholash faqat serverda (mock'da ham server simulyatsiya qilinadi).
 */

export type Locale = 'en' | 'ja';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

/** en majburiy, ja ixtiyoriy (yo'q bo'lsa en'ga fallback). */
export type LocalizedText = { en: string; ja?: string };

export type Option = { id: string; text: LocalizedText };

/* ----------------------------- Course / Section ---------------------------- */

export type CourseDTO = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  previewImage?: string;
  level: string;
  category: string;
  instructor: { id: string; fullName: string; picture?: string };
  sectionsCount: number;
  lessonsCount: number;
  isEnrolled: boolean;
};

export type LessonListItemDTO = {
  id: string;
  title: LocalizedText;
  position: number;
  durationSec: number;
  free: boolean;
  progress?: { watchedPercent: number; isCompleted: boolean };
};

export type SectionDTO = {
  id: string;
  title: LocalizedText;
  position: number;
  lessons: LessonListItemDTO[];
  hasQuiz: boolean;
};

/* -------------------------------- Lesson ----------------------------------- */

/** correctOptionId / explanation YO'Q — javob berilmaguncha mijozga ko'rinmaydi. */
export type TimedQuestionDTO = {
  id: string;
  triggerTimeSec: number;
  type: 'single_choice';
  question: LocalizedText;
  options: Option[];
  required: boolean;
};

export type LessonDetailDTO = {
  id: string;
  sectionId: string;
  courseId: string;
  title: LocalizedText;
  content: LocalizedText;
  videoUrl: string;
  durationSec: number;
  free: boolean;
  timedQuestions: TimedQuestionDTO[];
  answeredQuestionIds?: string[];
  progress?: { lastPositionSec: number; watchedPercent: number; isCompleted: boolean };
};

/** Timed question javobidan keyin server qaytaradigan natija. */
export type TimedAnswerResultDTO = {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation?: LocalizedText;
};

/* --------------------------------- Quiz ------------------------------------ */

export type QuizQuestionDTO = {
  id: string;
  question: LocalizedText;
  options: Option[];
  order: number;
};

export type QuizDTO = {
  id: string;
  sectionId: string;
  title: LocalizedText;
  passScore: number;
  timeLimitMin?: number;
  questions: QuizQuestionDTO[];
};

export type QuizAnswerInput = { questionId: string; selectedOptionId: string };

export type QuizAttemptResultDTO = {
  attemptId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  review: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation?: LocalizedText;
  }>;
};

/* ------------------------------- Progress ---------------------------------- */

export type WatchedRange = { start: number; end: number };

export type LessonProgressInput = {
  watchedRanges: WatchedRange[];
  lastPositionSec: number;
};

export type LessonProgressResultDTO = {
  watchedPercent: number;
  isCompleted: boolean;
};
