import { useAutoRead } from '../../hooks/useAutoRead';
import { useLanguage } from '../../hooks/useLanguage';

function AutoReadToggle() {
  const { autoReadMode, setAutoReadMode } = useAutoRead();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setAutoReadMode(!autoReadMode)}
      className={`inline-flex min-h-[48px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${autoReadMode ? 'border-[#F87171] bg-red-50 text-[#F87171] dark:bg-red-950/30' : 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-950/30'}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M5 14H9L14 18V6L9 10H5V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 9C19.3 10.2 20 11.7 20 13.5C20 15.3 19.3 16.8 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {t('common.autoRead', 'Auto Read')}
    </button>
  );
}

export default AutoReadToggle;
