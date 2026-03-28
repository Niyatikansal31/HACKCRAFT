import { useEffect } from 'react';
import { useAutoRead } from '../../hooks/useAutoRead';
import { useTTS } from '../../hooks/useTTS';
import SpeakerButton from '../ui/SpeakerButton';

function PageHeader({ title, description, breadcrumb, illustration }) {
  const { autoReadMode } = useAutoRead();
  const { speak } = useTTS();

  useEffect(() => {
    if (autoReadMode) {
      speak(`${title}. ${description || ''}`);
    }
  }, [autoReadMode, description, speak, title]);

  return (
    <div className="aid-card mb-6 overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">{breadcrumb}</p>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <SpeakerButton text={`${title}. ${description || ''}`} />
          </div>
          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <div className="justify-self-end">{illustration}</div>
      </div>
    </div>
  );
}

export default PageHeader;
