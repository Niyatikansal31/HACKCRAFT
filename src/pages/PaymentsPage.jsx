import { useEffect, useMemo } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { getAppointments, getPayments } from '../utils/appointments';
import { saveSnapshot } from '../utils/offlineStore';

function statusBadge(status) {
  const normalizedStatus = String(status || 'Paid').toLowerCase();
  if (normalizedStatus === 'paid') return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200';
  if (normalizedStatus === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200';
  return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200';
}

function PaymentsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const allPayments = useMemo(() => getPayments(), []);
  const appointments = useMemo(() => getAppointments(), []);

  const paymentRows = useMemo(() => {
    if (role === 'doctor') {
      const doctorName = String(user?.name || '').toLowerCase();
      return appointments
        .filter((item) => String(item.paymentStatus || '').toLowerCase() === 'paid')
        .filter((item) => {
          if (!doctorName) return true;
          return String(item.doctor || '').toLowerCase().includes(doctorName);
        })
        .map((item) => ({
          id: `consult-${item.id}`,
          date: item.date || '-',
          orderId: item.consultationId || item.id,
          label: `Consultation - ${item.patientName || 'Patient'}`,
          quantity: 1,
          amount: Number(item.paymentAmount || 0),
          status: 'Paid',
        }));
    }

    if (role === 'chemist') {
      return [];
    }

    return allPayments.map((item) => ({
      id: item.id,
      date: item.date || '-',
      orderId: item.orderId || item.appointmentId || '-',
      label: item.medicines || item.description || '-',
      quantity: item.quantity || 1,
      amount: Number(item.amount || 0),
      status: item.status || 'Paid',
    }));
  }, [allPayments, appointments, role, user?.name]);

  const total = paymentRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = paymentRows
    .filter((item) => String(item.status || '').toLowerCase() === 'pending')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const successful = paymentRows.filter((item) => String(item.status || '').toLowerCase() === 'paid').length;
  useEffect(() => {
    saveSnapshot('payment_history', paymentRows);
  }, [paymentRows]);

  const pageTitle = role === 'doctor' ? 'Earnings' : 'Payments';
  const pageDescription =
    role === 'doctor'
      ? 'Track consultation earnings from your patients.'
      : 'Track consultation and medicine payments in one place.';

  return (
    <AppShell>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumb="Dashboard / Payments"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="38" y="44" width="144" height="92" rx="20" fill="#DBEAFE" /><path d="M58 86H162" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><circle cx="78" cy="110" r="10" fill="#F87171" /></svg>}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="aid-card"><p className="text-sm text-gray-500">{role === 'doctor' ? 'Total Earned' : 'Total Spent'}</p><p className="mt-4 text-4xl font-extrabold">Rs. {total}</p></div>
        <div className="aid-card"><p className="text-sm text-gray-500">Pending</p><p className="mt-4 text-4xl font-extrabold text-[#F87171]">Rs. {pending}</p></div>
        <div className="aid-card"><p className="text-sm text-gray-500">{role === 'doctor' ? 'Paid Consultations' : 'Successful Payments'}</p><p className="mt-4 text-4xl font-extrabold text-blue-600">{successful}</p></div>
      </div>

      <div className="aid-card mt-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-4 text-left">Date</th>
              <th className="pb-4 text-left">{role === 'doctor' ? 'Consultation ID' : 'Order ID'}</th>
              <th className="pb-4 text-left">{role === 'doctor' ? 'Patient / Purpose' : 'Medicine / Purpose'}</th>
              <th className="pb-4 text-left">Quantity</th>
              <th className="pb-4 text-left">{role === 'doctor' ? 'Amount Earned' : 'Amount Paid'}</th>
              <th className="pb-4 text-left">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentRows.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-4">{item.date}</td>
                <td className="py-4">{item.orderId}</td>
                <td className="py-4">{item.label}</td>
                <td className="py-4">{item.quantity}</td>
                <td className="py-4">Rs. {item.amount}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {paymentRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-sm text-gray-500">
                  {role === 'doctor'
                    ? 'No consultation earnings recorded yet.'
                    : 'No payments recorded yet. Consultation and medicine purchases will appear here automatically.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export default PaymentsPage;
