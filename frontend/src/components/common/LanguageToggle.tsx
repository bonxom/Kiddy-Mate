import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { STORAGE_KEYS } from '../../api/client/apiConfig';
import type { AppLanguage } from '../../i18n/language';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

const LanguageToggle = ({ compact = false, className = '' }: LanguageToggleProps) => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';

  const changeLanguage = (language: AppLanguage) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    void i18n.changeLanguage(language);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/90 p-1 shadow-soft backdrop-blur ${className}`}
      aria-label={t('language.toggleLabel')}
    >
      {!compact && (
        <span className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Languages className="h-4 w-4" />
          {t('language.toggleLabel')}
        </span>
      )}

      {([
        ['en', t('language.english')],
        ['vi', t('language.vietnamese')],
      ] as const).map(([language, label]) => (
        <button
          key={language}
          type="button"
          onClick={() => changeLanguage(language)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
            currentLanguage === language
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {compact ? language.toUpperCase() : label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
