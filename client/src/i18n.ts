import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: {
    translation: fr
  },
  en: {
    translation: en
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default language
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Cache user language selection
      caches: ['localStorage'],
      
      // Don't convert country code to lowercase
      convertDetectedLanguage: (lng: string) => {
        // Only keep language code (fr, en) not country (fr-FR, en-US)
        return lng.split('-')[0];
      }
    }
  });

export default i18n;