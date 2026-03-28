import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import SpeakerButton from '../ui/SpeakerButton';

const roleLinks = {
  patient: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/symptom-checker', 'common.symptomChecker', 'Symptom Checker'],
    ['/doctors', 'common.findDoctors', 'Find Doctors'],
    ['/medicine-store', 'common.buyMedicines', 'Buy Medicines'],
    ['/appointments', 'common.myAppointments', 'My Appointments'],
    ['/medical-history', 'common.medicalHistory', 'Medical History'],
    ['/prescriptions', 'common.prescriptions', 'Prescriptions'],
    ['/payments', 'common.payments', 'Payments'],
    ['/emergency', 'common.emergency', 'Emergency'],
    ['/profile', 'common.settings', 'Settings'],
  ],
  doctor: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/appointments', 'doctor.schedule', 'My Schedule'],
    ['/notifications', 'doctor.requests', 'Patient Requests'],
    ['/consultation/demo', 'doctor.consultations', 'Consultations'],
    ['/payments', 'chemist.earnings', 'Earnings'],
    ['/profile', 'common.profile', 'Profile'],
    ['/profile', 'common.settings', 'Settings'],
  ],
  chemist: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/dashboard?section=orders', 'chemist.orders', 'Orders'],
    ['/dashboard?section=inventory', 'chemist.inventory', 'Inventory'],
    ['/dashboard?section=prescriptions', 'chemist.prescriptionsReceived', 'Prescriptions Received'],
    ['/dashboard?section=earnings', 'chemist.earnings', 'Earnings'],
    ['/dashboard?section=reports', 'chemist.analytics', 'Reports'],
    ['/dashboard?section=notifications', 'common.notifications', 'Notifications'],
    ['/profile', 'common.profile', 'Profile'],
    ['/profile', 'common.settings', 'Settings'],
  ],
};

function Sidebar({ mobileOpen, onClose, onEmergency }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const links = roleLinks[user?.role] || [];
  const showEmergency = user?.role === 'patient';

  return (
    <>
      {mobileOpen ? <button type="button" onClick={onClose} className="fixed inset-0 z-[85] bg-gray-950/50 lg:hidden" /> : null}
      <aside
        className={`fixed left-0 top-0 z-[90] flex h-screen w-80 flex-col border-r border-gray-200 bg-white p-6 transition-transform dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:translate-x-0 lg:rounded-3xl lg:border ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <p className="text-lg font-semibold">{t('sidebar.navigation', 'Navigation')}</p>
          <button type="button" onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>

        <div className="mb-8 rounded-3xl bg-blue-600 p-5 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-100">{t('sidebar.loggedInAs', 'Logged In As')}</p>
          <h3 className="mt-3 text-xl font-bold capitalize">{user?.role || t('sidebar.member', 'Member')}</h3>
          <p className="mt-2 text-sm text-blue-100">{user?.name || user?.shopName || 'AID AI User'}</p>
        </div>

        <nav className="space-y-2">
          {links.map(([path, key, fallback]) => {
            const label = t(key, fallback);
            return (
              <div key={`${path}-${label}`} className="flex items-center gap-2">
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block flex-1 rounded-2xl border-l-4 px-4 py-3 font-medium transition ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                    }`
                  }
                >
                  {label}
                </NavLink>
                <SpeakerButton text={label} className="h-8 w-8" />
              </div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {showEmergency ? (
            <button type="button" onClick={onEmergency} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-4 font-semibold text-white shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              {t('common.emergency', 'Emergency')}
            </button>
          ) : null}
          <button type="button" onClick={logout} className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
            {t('common.logout', 'Logout')}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
