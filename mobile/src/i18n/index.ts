import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Locale } from '@/types/dto';
import en from './locales/en';
import ja from './locales/ja';

/** Qurilma tilini aniqlaymiz: yapon bo'lsa ja, aks holda en. */
function detectLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === 'ja' ? 'ja' : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: detectLocale(),
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false },
});

export default i18n;
