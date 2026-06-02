import { create } from 'zustand';

import i18n from '@/i18n';
import type { Locale } from '@/types/dto';

type LanguageState = {
  /** Joriy til — ham UI (i18next), ham kontent (LocalizedText) uchun. */
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
};

export const useLanguage = create<LanguageState>((set, get) => ({
  locale: (i18n.language as Locale) === 'ja' ? 'ja' : 'en',
  setLocale: (locale) => {
    i18n.changeLanguage(locale);
    set({ locale });
  },
  toggle: () => {
    const next: Locale = get().locale === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(next);
    set({ locale: next });
  },
}));
