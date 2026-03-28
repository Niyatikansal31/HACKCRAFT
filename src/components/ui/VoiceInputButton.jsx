import { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useVoiceInput } from '../../hooks/useVoiceInput';

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0600-\u06FF ]/gi, '').trim();
}

function findClosestOption(transcript, options = []) {
  const cleaned = normalize(transcript);
  return options.find((option) => normalize(option.label).includes(cleaned) || cleaned.includes(normalize(option.label))) || null;
}

function VoiceInputButton({ onResult, options, onErrorMessage, className = '' }) {
  const { language, t } = useLanguage();
  const [hidden, setHidden] = useState(false);
  const { startListening, stopListening, isListening, supported } = useVoiceInput({
    lang: language,
    onResult: (transcript) => {
      if (options?.length) {
        const match = findClosestOption(transcript, options);
        if (match) {
          onResult(match.value);
          return;
        }
      }

      onResult(transcript);
    },
    onError: () => {
      onErrorMessage?.(t('common.tryAgainVoice', 'Voice not recognized, try again'));
    },
  });

  useEffect(() => {
    if (!supported) {
      setHidden(true);
    }
  }, [supported]);

  if (!supported || hidden) return null;

  return (
    <button
      type="button"
      onClick={() => (isListening ? stopListening() : startListening())}
      title={t('common.listening', 'Listening')}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${isListening ? 'border-red-300 bg-red-50 text-red-500 animate-pulse' : 'border-blue-200 bg-blue-50 text-blue-600'} ${className}`}
    >
      {isListening ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M6 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C14.2 15 16 13.2 16 11V7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7V11C8 13.2 9.8 15 12 15Z" stroke="currentColor" strokeWidth="2" />
          <path d="M5 11C5 15 8 18 12 18C16 18 19 15 19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export default VoiceInputButton;
