import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

const resources = {
  en: { translation: translationEN },
  vi: { translation: translationVI },
};

const savedLanguage = localStorage.getItem('linkup-language');
const browserLanguage = navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || browserLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (language) => {
  localStorage.setItem('linkup-language', language);
  document.documentElement.lang = language;
});

document.documentElement.lang = i18n.language;

export default i18n;
