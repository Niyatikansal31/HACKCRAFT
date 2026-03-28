import { useEffect } from 'react';
import { useAutoRead } from '../../hooks/useAutoRead';
import { useLanguage } from '../../hooks/useLanguage';
import { useTTS } from '../../hooks/useTTS';
import SpeakerButton from './SpeakerButton';

function Toast({ toast, onClose }) {
  const { autoReadMode } = useAutoRead();
  const { speak } = useTTS();
  const { t } = useLanguage();

  useEffect(() => {
    if (toast && autoReadMode) {
      speak(`${toast.title}. ${toast.message}`);
    }
  }, [autoReadMode, speak, toast]);

  if (!toast) return null;

  const tone =
    toast.type === 'success'
      ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200'
      : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200';

  return (
    <div className={`fixed right-4 top-4 z-[120] w-[90vw] max-w-sm animate-fadeIn rounded-2xl border p-4 shadow-xl ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{toast.title}</p>
            <SpeakerButton text={`${toast.title}. ${toast.message}`} />
          </div>
          <p className="mt-1 text-sm">{toast.message}</p>
        </div>
        <button onClick={onClose} className="text-lg leading-none" aria-label={t('common.close', 'Close')}>
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;
