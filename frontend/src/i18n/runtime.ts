import i18n from 'i18next';

import type { AppLanguage } from './language';
import { literalTranslations } from './resources';

interface RegexTranslationRule {
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
}

const regexTranslations: Record<AppLanguage, RegexTranslationRule[]> = {
  en: [
    {
      pattern: /^Vui lòng nhập họ và tên cho trẻ (\d+)$/u,
      translate: (match) => `Please enter full name for child ${match[1]}`,
    },
    {
      pattern: /^Vui lòng nhập ngày sinh cho trẻ (\d+)$/u,
      translate: (match) => `Please enter date of birth for child ${match[1]}`,
    },
    {
      pattern: /^Vui lòng nhập tên đăng nhập cho trẻ (\d+)$/u,
      translate: (match) => `Please enter username for child ${match[1]}`,
    },
    {
      pattern: /^Vui lòng nhập mật khẩu cho trẻ (\d+)$/u,
      translate: (match) => `Please enter password for child ${match[1]}`,
    },
    {
      pattern: /^Vui lòng hoàn tất phần đánh giá cho trẻ (\d+)$/u,
      translate: (match) => `Please complete the assessment for child ${match[1]}`,
    },
    {
      pattern: /^Chào (.+)! 🎮$/u,
      translate: (match) => `Welcome, ${match[1]}! 🎮`,
    },
  ],
  vi: [
    {
      pattern: /^Please enter full name for child (\d+)$/u,
      translate: (match) => `Vui lòng nhập họ và tên cho trẻ ${match[1]}`,
    },
    {
      pattern: /^Please enter date of birth for child (\d+)$/u,
      translate: (match) => `Vui lòng nhập ngày sinh cho trẻ ${match[1]}`,
    },
    {
      pattern: /^Please enter username for child (\d+)$/u,
      translate: (match) => `Vui lòng nhập tên đăng nhập cho trẻ ${match[1]}`,
    },
    {
      pattern: /^Please enter password for child (\d+)$/u,
      translate: (match) => `Vui lòng nhập mật khẩu cho trẻ ${match[1]}`,
    },
    {
      pattern: /^Please complete the assessment for child (\d+)$/u,
      translate: (match) => `Vui lòng hoàn tất phần đánh giá cho trẻ ${match[1]}`,
    },
    {
      pattern: /^Welcome, (.+)! 🎮$/u,
      translate: (match) => `Chào ${match[1]}! 🎮`,
    },
    {
      pattern: /^Successfully generated (\d+) tasks from emotion report!$/u,
      translate: (match) => `Đã tạo thành công ${match[1]} nhiệm vụ từ báo cáo cảm xúc!`,
    },
    {
      pattern: /^Generated (\d+) personalized tasks based on emotion analysis!$/u,
      translate: (match) => `Đã tạo ${match[1]} nhiệm vụ cá nhân hóa dựa trên phân tích cảm xúc!`,
    },
  ],
};

const getCurrentLanguage = (): AppLanguage => {
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  return currentLanguage.startsWith('vi') ? 'vi' : 'en';
};

const translateByRegex = (value: string, language: AppLanguage): string | null => {
  for (const rule of regexTranslations[language]) {
    const match = value.match(rule.pattern);
    if (match) {
      return rule.translate(match);
    }
  }

  return null;
};

export const translateUiString = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const language = getCurrentLanguage();
  const exactMatch = literalTranslations[language][value];
  if (exactMatch) {
    return exactMatch;
  }

  const regexMatch = translateByRegex(value, language);
  if (regexMatch) {
    return regexMatch;
  }

  return value;
};
