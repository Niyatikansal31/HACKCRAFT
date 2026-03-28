import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';

function MedicalHistoryPage() {
  return (
    <AppShell>
      <PageHeader
        title="Medical History"
        description="Track diagnoses, prescriptions, lab uploads, and consultation milestones in one timeline."
        breadcrumb="Dashboard / Medical History"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="50" y="20" width="120" height="140" rx="18" fill="#DBEAFE" /><path d="M80 58H140" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path d="M80 90H140" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /><path d="M80 122H124" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round" /></svg>}
      />
      <div className="aid-card">
        <div className="space-y-8">
          {[
            ['12 Mar 2026', 'General consultation completed'],
            ['18 Mar 2026', 'CBC report uploaded'],
            ['24 Mar 2026', 'Prescription renewed'],
          ].map(([date, label]) => (
            <div key={date} className="relative pl-10">
              <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">•</span>
              <p className="text-sm font-semibold text-blue-600">{date}</p>
              <p className="mt-2 text-lg font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default MedicalHistoryPage;
