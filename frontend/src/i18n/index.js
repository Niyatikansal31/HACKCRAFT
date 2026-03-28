import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import ur from './locales/ur.json';
import or from './locales/or.json';
import { languageCodeMap } from '../utils/constants';

const resources = {
  en: { translation: en },
  hi: { translation: { ...en, ...hi } },
  bn: { translation: { ...en, ...bn } },
  ta: { translation: { ...en, ...ta } },
  te: { translation: { ...en, ...te } },
  mr: { translation: { ...en, ...mr } },
  gu: { translation: { ...en, ...gu } },
  pa: { translation: { ...en, ...pa } },
  ur: { translation: { ...en, ...ur } },
  or: { translation: { ...en, ...or } }
};

const savedLanguage = localStorage.getItem('preferred_language') || 'en';

function applyDocumentLanguage(language) {
  const meta = languageCodeMap[language] || languageCodeMap.en;
  document.documentElement.lang = meta.bcp47;
  document.documentElement.dir = meta.dir;
}

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

applyDocumentLanguage(savedLanguage);

i18n.on('languageChanged', (language) => {
  localStorage.setItem('preferred_language', language);
  applyDocumentLanguage(language);
});

export default i18n;
