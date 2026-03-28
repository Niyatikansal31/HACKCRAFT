import { useEffect, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { notifications } from '../utils/mockData';
import { getChemistNotifications, markChemistNotificationRead } from '../utils/chemistApi';
import Toast from '../components/ui/Toast';

function NotificationsPage() {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const [toast, setToast] = useState(null);
  const [chemistNotifications, setChemistNotifications] = useState([]);

  useEffect(() => {
    if (role !== 'chemist') return;
    getChemistNotifications()
      .then((data) => setChemistNotifications(data.notifications || []))
      .catch((error) => setToast({ type: 'error', title: 'Notification load failed', message: error.message }));
  }, [role]);

  const visibleNotifications =
    role === 'chemist'
      ? chemistNotifications.map((item) => ({
          id: item._id,
          type: item.type,
          title: item.title,
          description: item.message,
          read: item.read,
          createdAt: item.createdAt,
        }))
      : notifications.filter((item) => item.audience === (role === 'doctor' ? 'doctor' : 'patient'));

  const markRead = async (id) => {
    try {
      await markChemistNotificationRead(id);
      const data = await getChemistNotifications();
      setChemistNotifications(data.notifications || []);
    } catch (error) {
      setToast({ type: 'error', title: 'Update failed', message: error.message });
    }
  };

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title="Notifications"
        description={
          role === 'chemist'
            ? 'Chemist-specific alerts: new orders, low stock, expiry, payment, and prescription reminders.'
            : role === 'doctor'
              ? 'Doctor alerts: requests, cancellations, messages, payment updates, and schedule reminders.'
              : 'Patient alerts: bookings, prescriptions, reminders, and wellness tips.'
        }
        breadcrumb="Dashboard / Notifications"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><path d="M110 30C84 30 64 50 64 76V102L52 126H168L156 102V76C156 50 136 30 110 30Z" fill="#DBEAFE" /><path d="M88 142C92 150 100 154 110 154C120 154 128 150 132 142" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>}
      />

      <div className="aid-card space-y-4">
        {visibleNotifications.map((item) => (
          <div key={`${item.id || item.type}-${item.title}`} className={`flex gap-4 rounded-2xl border p-4 ${role === 'chemist' && !item.read ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="mt-1 rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/40">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
              {role === 'chemist' ? <p className="mt-1 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('en-IN')}</p> : null}
              {role === 'chemist' && !item.read ? (
                <button type="button" className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => markRead(item.id)}>
                  Mark as read
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {visibleNotifications.length === 0 ? <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-900">No notifications available right now.</div> : null}
      </div>
    </AppShell>
  );
}

export default NotificationsPage;
