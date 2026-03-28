import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import { mockDoctors } from '../../utils/mockData';

function AdminDoctorsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Admin Doctors"
        description="Review doctors, credentials, and verification state."
        breadcrumb="Admin / Doctors"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><circle cx="110" cy="68" r="30" fill="#DBEAFE" /><circle cx="110" cy="68" r="25" stroke="currentColor" strokeWidth="3" /><path d="M64 154C72 116 148 116 156 154" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
      />
      <div className="aid-card space-y-4">
        {mockDoctors.map((doctor) => (
          <div key={doctor.id} className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <div><p className="font-semibold">{doctor.name}</p><p className="text-sm text-gray-500">{doctor.specialization}</p></div>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Verify</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default AdminDoctorsPage;
