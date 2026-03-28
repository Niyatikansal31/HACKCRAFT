import { useLanguage } from '../../hooks/useLanguage';
import SpeakerButton from '../ui/SpeakerButton';

function RoleSelectionCard({ role, selected, onSelect, illustration }) {
  const { t } = useLanguage();
  const title = t(role.titleKey, role.title);
  const subtitle = t(role.subtitleKey, role.subtitle);

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      className={`group rounded-3xl border p-5 text-left transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-glow dark:border-blue-400 dark:bg-blue-950/40'
          : 'border-gray-200 bg-white hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <div className="mb-4">{illustration}</div>
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <SpeakerButton text={`${title}. ${subtitle}`} />
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
    </button>
  );
}

export default RoleSelectionCard;
