import { languageOptions } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('common.language', 'Language')}</label>
      <select value={language} onChange={(event) => setLanguage(event.target.value)} className="aid-input max-w-[220px] py-2 text-sm">
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
