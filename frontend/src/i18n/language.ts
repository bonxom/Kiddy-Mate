export type AppLanguage = 'vi';

export const DEFAULT_LANGUAGE: AppLanguage = 'vi';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['vi'];

export const normalizeLanguage = (): AppLanguage => DEFAULT_LANGUAGE;

export const detectBrowserLanguage = (): AppLanguage => DEFAULT_LANGUAGE;
