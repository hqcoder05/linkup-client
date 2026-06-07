import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

// Cấu hình các ngôn ngữ
const resources = {
  en: { translation: translationEN },
  vi: { translation: translationVI }
};

i18n
  .use(initReactI18next) // Truyền i18n instance cho react-i18next
  .init({
    resources,
    lng: 'en', // Ngôn ngữ mặc định
    fallbackLng: 'en', // Nếu ngôn ngữ hiện tại không có từ khóa dịch, sẽ fallback về tiếng Anh
    interpolation: {
      escapeValue: false // React đã tự động escape chống XSS rồi
    }
  });

export default i18n;