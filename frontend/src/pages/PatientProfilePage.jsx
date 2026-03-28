import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import FieldLabel from '../components/ui/FieldLabel';
import FormFieldCard from '../components/ui/FormFieldCard';
import { useLanguage } from '../hooks/useLanguage';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';

const icons = {
  name: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M5 20C6 16.5 9 15 12 15C15 15 18 16.5 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  email: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 7H20V17H4V7Z" stroke="currentColor" strokeWidth="1.8" /><path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="1.8" /></svg>,
  phone: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M8 4H5C4.4 4 4 4.4 4 5V8C4 14.6 9.4 20 16 20H19C19.6 20 20 19.6 20 19V16L15.5 14L13 16.5C10.8 15.4 8.6 13.2 7.5 11L10 8.5L8 4Z" stroke="currentColor" strokeWidth="1.8" /></svg>,
  city: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 18 15 18 10C18 6.7 15.3 4 12 4C8.7 4 6 6.7 6 10C6 15 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>,
  blood: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 4C12 4 7 10.2 7 14C7 17 9.2 20 12 20C14.8 20 17 17 17 14C17 10.2 12 4 12 4Z" stroke="currentColor" strokeWidth="1.8" /></svg>,
  language: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 7C8 11 10 14 12 16C14 14 16 11 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M10 17H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

function PatientProfilePage() {
  const { t } = useLanguage();
  const { lowDataMode, toggleLowDataMode, networkStrength, isOnline } = useConnectivity();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bloodGroup: '',
    preferredLanguage: '',
    preferredDoctorName: user?.preferredDoctorName || '',
    preferredDoctorPhone: user?.preferredDoctorPhone || '',
  });

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const renderInput = (name, label, icon, placeholder) => (
    <FormFieldCard>
      <FieldLabel label={label} icon={icon} />
      <input className="aid-input" value={form[name]} onChange={(event) => setField(name, event.target.value)} placeholder={placeholder} />
    </FormFieldCard>
  );

  return (
    <AppShell>
      <PageHeader
        title={t('dashboard.profileSettings', 'Profile Settings')}
        description={t('dashboard.profileSettingsDesc', 'Update account details, personal health context, and communication preferences.')}
        breadcrumb="Dashboard / Profile"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><circle cx="110" cy="60" r="30" fill="#DBEAFE" /><circle cx="110" cy="60" r="25" stroke="currentColor" strokeWidth="3" /><path d="M62 150C70 112 150 112 158 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.35fr_0.65fr]">
        <div className="aid-card text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40">
            <svg className="h-14 w-14" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" /><path d="M12 38C14 29 34 29 36 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </div>
          <button type="button" className="mt-5 rounded-2xl border border-blue-600 px-5 py-3 font-semibold text-blue-600">{t('common.uploadPhoto', 'Upload Photo')}</button>
        </div>
        <div className="aid-card">
          <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-900">
            <p className="font-semibold">Network Status: {isOnline ? `Online (${networkStrength})` : 'Offline'}</p>
            <button type="button" className={`mt-3 rounded-lg px-4 py-2 font-semibold ${lowDataMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`} onClick={toggleLowDataMode}>
              Low Data Mode: {lowDataMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderInput('name', t('common.fullName', 'Full name'), icons.name, t('common.fullName', 'Full name'))}
            {renderInput('email', t('common.email', 'Email'), icons.email, 'you@example.com')}
            {renderInput('phone', t('common.phone', 'Phone'), icons.phone, '9876543210')}
            {renderInput('city', t('common.city', 'City'), icons.city, t('common.city', 'City'))}
            {renderInput('bloodGroup', t('common.bloodGroup', 'Blood group'), icons.blood, t('common.bloodGroup', 'Blood group'))}
            {renderInput('preferredLanguage', t('common.preferredLanguage', 'Preferred language'), icons.language, t('common.preferredLanguage', 'Preferred language'))}
            {renderInput('preferredDoctorName', 'Preferred Doctor Name', icons.name, 'Doctor name')}
            {renderInput('preferredDoctorPhone', 'Preferred Doctor Phone', icons.phone, '10-digit phone')}
          </div>
          <button type="button" className="aid-btn-primary mt-6" onClick={() => updateProfile(form)}>{t('common.saveChanges', 'Save Changes')}</button>
        </div>
      </div>
    </AppShell>
  );
}

export default PatientProfilePage;
