import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

function PasswordInput({ value, onChange, name, placeholder }) {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="aid-input pr-14"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-sm font-semibold text-blue-600"
        >
          {visible ? t('auth.hide', 'Hide') : t('auth.show', 'Show')}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
