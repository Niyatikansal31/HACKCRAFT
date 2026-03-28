import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../auth/AuthLayout';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from '../auth/LanguageSelector';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import Badge from '../ui/Badge';
import SpeakerButton from '../ui/SpeakerButton';
import AutoReadToggle from '../ui/AutoReadToggle';
import { useConnectivity } from '../../hooks/useConnectivity';

const publicLinks = [
  ['/', 'common.home', 'Home'],
  ['/doctors', 'common.findDoctors', 'Find Doctors'],
  ['/symptom-checker', 'common.symptomChecker', 'Symptom Checker'],
  ['/appointments', 'common.appointments', 'Appointments'],
];

const roleLinks = {
  patient: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/doctors', 'common.findDoctors', 'Find Doctors'],
    ['/symptom-checker', 'common.symptomChecker', 'Symptom Checker'],
    ['/appointments', 'common.appointments', 'Appointments'],
  ],
  doctor: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/appointments', 'doctor.schedule', 'My Schedule'],
    ['/consultation/demo', 'doctor.consultations', 'Consultations'],
    ['/notifications', 'doctor.requests', 'Patient Requests'],
  ],
  chemist: [
    ['/dashboard', 'common.dashboard', 'Dashboard'],
    ['/dashboard?section=orders', 'chemist.orders', 'Orders'],
    ['/dashboard?section=inventory', 'chemist.inventory', 'Inventory'],
    ['/dashboard?section=prescriptions', 'common.prescriptions', 'Prescriptions'],
    ['/dashboard?section=earnings', 'chemist.earnings', 'Earnings'],
  ],
  admin: [
    ['/admin', 'common.dashboard', 'Dashboard'],
    ['/admin/doctors', 'admin.doctors', 'Doctors'],
    ['/admin/users', 'admin.users', 'Users'],
  ],
};

function Navbar({ onOpenSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const { networkStrength, isOnline, lowDataMode, toggleLowDataMode } = useConnectivity();
  const navLinks = isAuthenticated ? roleLinks[user?.role] || roleLinks.patient : publicLinks;

  return (
    <header className="sticky top-0 z-[80] border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button type="button" onClick={onOpenSidebar} className="rounded-xl border border-gray-200 p-3 lg:hidden dark:border-gray-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map(([path, key, fallback]) => {
            const label = t(key, fallback);
            return (
              <div key={path} className="flex items-center gap-2">
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600 dark:text-gray-300'}`
                  }
                >
                  {label}
                </NavLink>
                <SpeakerButton text={label} className="h-8 w-8" />
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-flex ${isOnline ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200'}`}>
            {isOnline ? `Network: ${networkStrength}` : 'Offline'}
          </span>
          <button
            type="button"
            onClick={toggleLowDataMode}
            className={`hidden rounded-full px-3 py-2 text-xs font-semibold md:inline-flex ${lowDataMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
          >
            Low Data: {lowDataMode ? 'ON' : 'OFF'}
          </button>
          <AutoReadToggle />
          <ThemeToggle />
          <div className="hidden md:block">
            <LanguageSelector />
          </div>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 sm:px-5 sm:py-3 sm:text-base">
                {t('common.login', 'Login')}
              </Link>
              <Link to="/signup" className="aid-btn-accent px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base">
                {t('common.register', 'Register')}
              </Link>
            </>
          ) : (
            <>
              <Link to="/notifications" className="relative rounded-full border border-gray-200 p-3 dark:border-gray-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4C8.7 4 6 6.7 6 10V13.4L4.7 16.1C4.4 16.8 4.9 17.5 5.6 17.5H18.4C19.1 17.5 19.6 16.8 19.3 16.1L18 13.4V10C18 6.7 15.3 4 12 4Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#F87171]" />
              </Link>
              <div className="hidden items-center gap-3 rounded-full border border-gray-200 px-4 py-2 md:flex dark:border-gray-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                  {user?.name?.[0] || user?.shopName?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.name || user?.shopName || 'Account'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge>{user?.role}</Badge>
                    <button type="button" onClick={logout} className="text-xs font-semibold text-[#F87171]">
                      {t('common.logout', 'Logout')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
