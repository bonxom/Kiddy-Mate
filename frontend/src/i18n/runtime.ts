import i18n from 'i18next';

import { literalTranslations } from './resources';

interface RegexTranslationRule {
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
}

const regexTranslations: RegexTranslationRule[] = [
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
  {
    pattern: /^Emotion report analyzed! Generated (\d+) personalized tasks\.$/u,
    translate: (match) => `Đã phân tích báo cáo cảm xúc và tạo ${match[1]} nhiệm vụ cá nhân hóa.`,
  },
  {
    pattern: /^(.+) updated successfully!$/u,
    translate: (match) => `Đã cập nhật ${match[1]} thành công!`,
  },
  {
    pattern: /^(.+) added successfully!$/u,
    translate: (match) => `Đã thêm ${match[1]} thành công!`,
  },
  {
    pattern: /^(.+) deleted successfully$/u,
    translate: (match) => `Đã xóa ${match[1]} thành công.`,
  },
  {
    pattern: /^Failed to update quantity: (.+)$/u,
    translate: (match) => `Không thể cập nhật số lượng: ${match[1]}`,
  },
  {
    pattern: /^Failed to save reward: (.+)$/u,
    translate: (match) => `Không thể lưu phần thưởng: ${match[1]}`,
  },
  {
    pattern: /^Failed to delete reward: (.+)$/u,
    translate: (match) => `Không thể xóa phần thưởng: ${match[1]}`,
  },
  {
    pattern: /^Task cannot be verified\. Current status: (.+)\. Task must be in "need-verify" status\.$/u,
    translate: (match) =>
      `Không thể xác thực nhiệm vụ. Trạng thái hiện tại: ${translateUiString(match[1])}. Nhiệm vụ phải ở trạng thái chờ xác minh.`,
  },
  {
    pattern: /^All tasks have been assigned to (.+)\. Create a new task to get started\.$/u,
    translate: (match) => `Tất cả nhiệm vụ đã được giao cho ${match[1]}. Hãy tạo nhiệm vụ mới để bắt đầu.`,
  },
  {
    pattern: /^Edit Profile: (.+)$/u,
    translate: (match) => `Chỉnh sửa hồ sơ: ${match[1]}`,
  },
];

const translateByRegex = (value: string): string | null => {
  for (const rule of regexTranslations) {
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

  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'vi';
  if (currentLanguage.startsWith('vi')) {
    const exactMatch = literalTranslations[value];
    if (exactMatch) {
      return exactMatch;
    }

    const regexMatch = translateByRegex(value);
    if (regexMatch) {
      return regexMatch;
    }
  }

  return value;
};

const LOCALIZABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const;
const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);

const preserveWhitespace = (original: string, translated: string): string => {
  const leadingWhitespace = original.match(/^\s*/u)?.[0] ?? '';
  const trailingWhitespace = original.match(/\s*$/u)?.[0] ?? '';
  return `${leadingWhitespace}${translated}${trailingWhitespace}`;
};

const localizeTextNode = (node: Text) => {
  const parentTagName = node.parentElement?.tagName;
  if (!node.nodeValue || (parentTagName && IGNORED_TAGS.has(parentTagName))) {
    return;
  }

  const trimmedValue = node.nodeValue.trim();
  if (!trimmedValue) {
    return;
  }

  const translatedValue = translateUiString(trimmedValue);
  if (translatedValue !== trimmedValue) {
    node.nodeValue = preserveWhitespace(node.nodeValue, translatedValue);
  }
};

const localizeElement = (element: Element) => {
  if (IGNORED_TAGS.has(element.tagName)) {
    return;
  }

  for (const attributeName of LOCALIZABLE_ATTRIBUTES) {
    const attributeValue = element.getAttribute(attributeName);
    if (!attributeValue) {
      continue;
    }

    const translatedValue = translateUiString(attributeValue);
    if (translatedValue !== attributeValue) {
      element.setAttribute(attributeName, translatedValue);
    }
  }
};

export const localizeDomSubtree = (root: Node) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (root.nodeType === Node.TEXT_NODE) {
    localizeTextNode(root as Text);
    return;
  }

  if (!(root instanceof Element) && !(root instanceof DocumentFragment) && !(root instanceof Document)) {
    return;
  }

  if (root instanceof Element) {
    localizeElement(root);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      localizeTextNode(currentNode as Text);
    } else if (currentNode instanceof Element) {
      localizeElement(currentNode);
    }

    currentNode = walker.nextNode();
  }
};
