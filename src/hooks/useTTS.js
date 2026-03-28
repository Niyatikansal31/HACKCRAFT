import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from './useLanguage';
import { languageCodeMap } from '../utils/constants';

export function useTTS() {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lang = useMemo(() => (languageCodeMap[language] || languageCodeMap.en).bcp47, [language]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const speak = (text, overrideLang) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = overrideLang || lang;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return { speak, stop, isSpeaking, lang };
}
