import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';

function AdminUsersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Admin Users"
        description="Audit patient and chemist accounts, status, and activity."
        breadcrumb="Admin / Users"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><circle cx="76" cy="76" r="22" fill="#DBEAFE" /><circle cx="144" cy="76" r="22" fill="#FEE2E2" /><path d="M38 150C44 122 106 122 112 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M108 150C114 122 176 122 182 150" stroke="#F87171" strokeWidth="3" strokeLinecap="round" /></svg>}
      />
      <div className="aid-card space-y-4">
        {['Riya Sharma', 'Aman Patel', 'CityCare Pharmacy'].map((user) => (
          <div key={user} className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="font-semibold">{user}</p>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-200">Active</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default AdminUsersPage;
