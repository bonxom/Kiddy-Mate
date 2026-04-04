import { translateUiString } from '../i18n/runtime';

const SKILL_LABEL_MAP: Record<string, string> = {
  independence: 'Độc lập',
  emotional: 'EQ',
  discipline: 'Kỷ luật',
  social: 'Xã hội',
  logic: 'IQ',
};

const EMOTION_LABEL_MAP: Record<string, string> = {
  happy: 'Vui vẻ',
  excited: 'Hào hứng',
  curious: 'Tò mò',
  proud: 'Tự hào',
  worried: 'Lo lắng',
  frustrated: 'Thất vọng',
  angry: 'Tức giận',
  sad: 'Buồn',
  scared: 'Sợ hãi',
  neutral: 'Bình thường',
  calm: 'Bình tĩnh',
  content: 'Hài lòng',
  confident: 'Tự tin',
  engaged: 'Tập trung',
  satisfied: 'Thỏa mãn',
  motivated: 'Có động lực',
  determined: 'Quyết tâm',
  hopeful: 'Hy vọng',
  persistent: 'Kiên trì',
  discouraged: 'Nản lòng',
  challenged: 'Đang gặp thử thách',
  positive: 'Tích cực',
};

const normalizeKey = (value?: string | null): string => (value || '').trim().toLowerCase();

export const localizeSkillName = (skill?: string | null): string => {
  if (!skill) return '';
  const mapped = SKILL_LABEL_MAP[normalizeKey(skill)];
  return mapped || translateUiString(skill);
};

export const localizeEmotionName = (emotion?: string | null): string => {
  if (!emotion) return '';
  const mapped = EMOTION_LABEL_MAP[normalizeKey(emotion)];
  return mapped || translateUiString(emotion);
};

export const localizeEmotionText = (text?: string | null): string => {
  if (!text) return '';

  let localized = text;
  for (const [english, vietnamese] of Object.entries(EMOTION_LABEL_MAP)) {
    const pattern = new RegExp(`\\b${english}\\b`, 'gi');
    localized = localized.replace(pattern, vietnamese);
  }
  return localized;
};
