import { createContext, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n';
import enTranslations from '../i18n/locales/en.json';
import { languageCodeMap } from '../utils/constants';

export const LanguageContext = createContext(null);

const reverseEnglishLookup = Object.entries(enTranslations).reduce((accumulator, [key, value]) => {
  if (typeof value === 'string') {
    accumulator[value] = key;
  }
  return accumulator;
}, {});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(i18n.language || localStorage.getItem('preferred_language') || 'en');

  useEffect(() => {
    const handleLanguageChange = (nextLanguage) => {
      setLanguageState(nextLanguage);
      const meta = languageCodeMap[nextLanguage] || languageCodeMap.en;
      window.__aidVoiceLanguage = meta.bcp47;
      window.__aidSpeechLanguage = meta.bcp47;
    };

    handleLanguageChange(language);
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage) => i18n.changeLanguage(nextLanguage),
      t: (key, fallback = key, options = {}) => {
        const direct = i18n.t(key, { defaultValue: '', ...options });
        if (direct) return direct;

        const fallbackKey = reverseEnglishLookup[fallback];
        if (fallbackKey) {
          return i18n.t(fallbackKey, { defaultValue: fallback, ...options });
        }

        return fallback;
      },
      currentBcp47: (languageCodeMap[language] || languageCodeMap.en).bcp47,
      isRTL: (languageCodeMap[language] || languageCodeMap.en).dir === 'rtl',
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
