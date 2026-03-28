import { useEffect, useState } from 'react';

const AUTO_READ_KEY = 'auto_read_mode';
const AUTO_READ_EVENT = 'aid-auto-read-change';

export function useAutoRead() {
  const [autoReadMode, setAutoReadModeState] = useState(() => localStorage.getItem(AUTO_READ_KEY) === 'true');

  useEffect(() => {
    const sync = () => setAutoReadModeState(localStorage.getItem(AUTO_READ_KEY) === 'true');
    window.addEventListener(AUTO_READ_EVENT, sync);
    return () => window.removeEventListener(AUTO_READ_EVENT, sync);
  }, []);

  const setAutoReadMode = (value) => {
    localStorage.setItem(AUTO_READ_KEY, String(value));
    window.dispatchEvent(new Event(AUTO_READ_EVENT));
    setAutoReadModeState(value);
  };

  return { autoReadMode, setAutoReadMode };
}
