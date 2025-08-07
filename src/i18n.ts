import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uzTranslation from './locales/uz/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: {
        translation: uzTranslation
      }
    },
    lng: 'uz',
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;