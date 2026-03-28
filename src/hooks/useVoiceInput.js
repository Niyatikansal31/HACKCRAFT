import { useEffect, useMemo, useRef, useState } from 'react';
import { languageCodeMap } from '../utils/constants';

export function useVoiceInput({ lang = 'en', onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const bcp47 = useMemo(() => (languageCodeMap[lang] || languageCodeMap.en).bcp47, [lang]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const startListening = () => {
    if (!supported) {
      onError?.(new Error('unsupported'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = bcp47;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => {
      setIsListening(false);
      onError?.(event);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const result = event.results?.[0]?.[0]?.transcript?.trim() || '';
      setTranscript(result);
      onResult?.(result);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  return { startListening, stopListening, isListening, transcript, supported, bcp47 };
}
