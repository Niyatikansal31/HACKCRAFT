import Badge from '../ui/Badge';

function AmbulanceCard({ type = 'doctor', title, subtitle, phone, actionLabel, onAction, meta }) {
  const icon =
    type === 'doctor' ? (
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-blue-600">
        <circle cx="24" cy="16" r="8" fill="currentColor" opacity="0.2" />
        <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M12 38C14 29 34 29 36 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 15H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-[#F87171]">
        <rect x="7" y="15" width="28" height="16" rx="5" fill="currentColor" opacity="0.18" />
        <path d="M7 31V19C7 16.8 8.8 15 11 15H29C31.2 15 33 16.8 33 19V31" stroke="currentColor" strokeWidth="2" />
        <path d="M33 21H39L42 26V31H33" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="35" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M17 23H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 20V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );

  return (
    <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800">{icon}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{title}</h4>
            {meta ? <Badge color="green">{meta}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
          {phone ? <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{phone}</p> : null}
          <button type="button" onClick={onAction} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AmbulanceCard;
