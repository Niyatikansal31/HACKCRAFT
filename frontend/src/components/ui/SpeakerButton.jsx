import { useMemo } from 'react';
import { useTTS } from '../../hooks/useTTS';

function SpeakerButton({ text, className = '', title }) {
  const { speak, stop, isSpeaking } = useTTS();
  const label = useMemo(() => title || (isSpeaking ? 'Stop reading' : 'Read aloud'), [isSpeaking, title]);

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : speak(text))}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition ${isSpeaking ? 'text-[#F87171]' : 'text-blue-600'} ${className}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M5 14H9L14 18V6L9 10H5V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 9C19.3 10.2 20 11.7 20 13.5C20 15.3 19.3 16.8 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={isSpeaking ? 'animate-pulse' : ''} />
        <path d="M16 10.5C16.7 11.2 17 12 17 13C17 14 16.7 14.8 16 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={isSpeaking ? 'animate-pulse' : ''} />
      </svg>
    </button>
  );
}

export default SpeakerButton;
