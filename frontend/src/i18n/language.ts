export type AppLanguage = 'en' | 'vi';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'vi'];

export const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }

  const lowerValue = value.toLowerCase();

  if (lowerValue.startsWith('vi')) {
    return 'vi';
  }

  return 'en';
};

export const detectBrowserLanguage = (): AppLanguage => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  return normalizeLanguage(navigator.language);
};
