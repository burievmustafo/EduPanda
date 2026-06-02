import { useLanguage } from '@/store/language-store';

/** Joriy kontent/UI tilini qaytaradi (en | ja). */
export const useLocale = () => useLanguage((s) => s.locale);
