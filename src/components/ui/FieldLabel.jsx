import SpeakerButton from './SpeakerButton';

function FieldLabel({ label, icon, htmlFor }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
          {icon}
        </span>
        <span>{label}</span>
      </label>
      <SpeakerButton text={label} />
    </div>
  );
}

export default FieldLabel;
