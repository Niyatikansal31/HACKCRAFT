function EmergencyButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="fixed bottom-24 right-6 z-[90] flex flex-col items-center">
      <span className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-red-500/40" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl">
        <svg viewBox="0 0 48 48" className="h-8 w-8">
          <rect x="7" y="18" width="22" height="12" rx="3" fill="currentColor" opacity="0.2" />
          <path d="M7 30V20C7 18.9 7.9 18 9 18H27C28.1 18 29 18.9 29 20V30" stroke="white" strokeWidth="2" />
          <path d="M29 22H36L40 27V30H29" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="15" cy="33" r="3.5" stroke="white" strokeWidth="2" />
          <circle cx="33" cy="33" r="3.5" stroke="white" strokeWidth="2" />
          <path d="M16 24H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 22V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="relative mt-2 text-xs font-bold uppercase tracking-[0.25em] text-red-500">SOS</span>
    </button>
  );
}

export default EmergencyButton;
