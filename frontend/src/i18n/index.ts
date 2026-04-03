import i18n from 'i18next';
import toast from 'react-hot-toast';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';
import { localizeDomSubtree, translateUiString } from './runtime';

void i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

let runtimePatched = false;
let domLocalizationInstalled = false;

const installDomLocalization = () => {
  if (domLocalizationInstalled || typeof window === 'undefined') {
    return;
  }

  const mountLocalization = () => {
    if (!document.body) {
      window.requestAnimationFrame(mountLocalization);
      return;
    }

    localizeDomSubtree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => localizeDomSubtree(node));
        }

        if (mutation.type === 'characterData') {
          localizeDomSubtree(mutation.target);
        }

        if (mutation.type === 'attributes') {
          localizeDomSubtree(mutation.target);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    });

    domLocalizationInstalled = true;
  };

  mountLocalization();
};

export const installLocalizationRuntimePatches = () => {
  if (runtimePatched || typeof window === 'undefined') {
    return;
  }

  const originalAlert = window.alert.bind(window);
  window.alert = (message?: string) => {
    originalAlert(translateUiString(message));
  };

  const originalSuccess = toast.success.bind(toast);
  const originalError = toast.error.bind(toast);
  const originalLoading = toast.loading.bind(toast);
  const originalToast = toast.bind(toast);

  toast.success = ((message, options) =>
    originalSuccess(typeof message === 'string' ? translateUiString(message) : message, options)) as typeof toast.success;
  toast.error = ((message, options) =>
    originalError(typeof message === 'string' ? translateUiString(message) : message, options)) as typeof toast.error;
  toast.loading = ((message, options) =>
    originalLoading(typeof message === 'string' ? translateUiString(message) : message, options)) as typeof toast.loading;
  Object.assign(originalToast, toast);

  installDomLocalization();
  runtimePatched = true;
};

export default i18n;
