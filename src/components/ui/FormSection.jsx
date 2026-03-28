import SpeakerButton from './SpeakerButton';

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-950">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <SpeakerButton text={`${title}. ${description || ''}`} />
        </div>
        {description ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default FormSection;
