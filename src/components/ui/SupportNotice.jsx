import SpeakerButton from './SpeakerButton';

function SupportNotice({ title, text, tone = 'blue' }) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200',
    green: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200',
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center gap-2">
        <p className="font-semibold">{title}</p>
        <SpeakerButton text={`${title}. ${text}`} />
      </div>
      <p className="mt-1 text-sm">{text}</p>
    </div>
  );
}

export default SupportNotice;
