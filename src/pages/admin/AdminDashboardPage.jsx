import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';

function AdminDashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="Admin Dashboard"
        description="High-level oversight across users, doctors, and platform operations."
        breadcrumb="Admin / Dashboard"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="34" y="28" width="152" height="124" rx="24" fill="#DBEAFE" /><path d="M60 116L88 88L110 102L144 64L160 82" stroke="#F87171" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        {['Total Users', 'Pending Verifications', 'Emergency Escalations'].map((item, index) => (
          <div key={item} className="aid-card"><p className="text-sm text-gray-500">{item}</p><p className="mt-4 text-4xl font-extrabold">{[12840, 53, 12][index]}</p></div>
        ))}
      </div>
    </AppShell>
  );
}

export default AdminDashboardPage;
