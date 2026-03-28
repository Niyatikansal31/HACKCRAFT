import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import SupportNotice from '../components/ui/SupportNotice';
import FieldLabel from '../components/ui/FieldLabel';
import FormFieldCard from '../components/ui/FormFieldCard';
import SpeakerButton from '../components/ui/SpeakerButton';
import VoiceInputButton from '../components/ui/VoiceInputButton';
import { mockDoctors } from '../utils/mockData';
import { saveDoctorContacts } from '../utils/offlineStore';
import { useLanguage } from '../hooks/useLanguage';

const icons = {
  search: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" /><path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  language: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 7C8 11 10 14 12 16C14 14 16 11 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  fee: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M16 8C15.2 6.9 13.9 6.3 12.5 6.3C10.6 6.3 9 7.4 9 9C9 12 16 11 16 14C16 15.6 14.4 16.7 12.5 16.7C11.1 16.7 9.8 16.1 9 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

function DoctorListPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    search: '',
    language: t('doctors.anyLanguage', 'Any language'),
    feeRange: t('doctors.anyFeeRange', 'Any fee range'),
  });

  const feeOptions = [
    t('doctors.anyFeeRange', 'Any fee range'),
    t('doctors.below700', 'Below Rs. 700'),
    t('doctors.range700to1000', 'Rs. 700 - Rs. 1000'),
    t('doctors.above1000', 'Above Rs. 1000'),
  ];
  const languageOptions = [t('doctors.anyLanguage', 'Any language'), 'Hindi', 'English', 'Bengali', 'Tamil'];

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter((doctor) => {
      const searchMatch =
        !filters.search ||
        doctor.specialization.toLowerCase().includes(filters.search.toLowerCase()) ||
        doctor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        doctor.city.toLowerCase().includes(filters.search.toLowerCase());

      const languageMatch = filters.language === t('doctors.anyLanguage', 'Any language') || doctor.languages.includes(filters.language);

      const feeMatch =
        filters.feeRange === t('doctors.anyFeeRange', 'Any fee range') ||
        (filters.feeRange === t('doctors.below700', 'Below Rs. 700') && doctor.fee < 700) ||
        (filters.feeRange === t('doctors.range700to1000', 'Rs. 700 - Rs. 1000') && doctor.fee >= 700 && doctor.fee <= 1000) ||
        (filters.feeRange === t('doctors.above1000', 'Above Rs. 1000') && doctor.fee > 1000);

      return searchMatch && languageMatch && feeMatch;
    });
  }, [filters, t]);

  useEffect(() => {
    saveDoctorContacts(
      mockDoctors.map((doctor) => ({
        phone: doctor.phone,
        name: doctor.name,
        specialization: doctor.specialization,
      })),
    );
  }, []);

  return (
    <AppShell>
      <PageHeader
        title={t('dashboard.findDoctor', 'Find a doctor')}
        description={t('dashboard.findDoctorDesc', 'Use the simple search below and choose the doctor that feels right for you.')}
        breadcrumb="Dashboard / Doctors"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><circle cx="90" cy="64" r="28" fill="#DBEAFE" /><circle cx="90" cy="64" r="24" stroke="currentColor" strokeWidth="3" /><path d="M44 150C52 114 128 114 136 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><circle cx="160" cy="118" r="24" fill="#FEE2E2" /><path d="M160 106V130" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /><path d="M148 118H172" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /></svg>}
      />

      <div className="space-y-6">
        <div className="aid-card">
          <div className="grid gap-4 lg:grid-cols-3">
            <FormFieldCard>
              <FieldLabel label={t('common.search', 'Search')} icon={icons.search} />
              <div className="relative">
                <input className="aid-input pr-14" placeholder={t('doctors.searchPlaceholder', 'Search doctor, city, or illness')} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={(value) => setFilters((current) => ({ ...current, search: value }))} />
                </div>
              </div>
            </FormFieldCard>
            <FormFieldCard>
              <FieldLabel label={t('common.language', 'Language')} icon={icons.language} />
              <div className="relative">
                <select className="aid-input pr-14" value={filters.language} onChange={(event) => setFilters((current) => ({ ...current, language: event.target.value }))}>
                  {languageOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton options={languageOptions.map((option) => ({ label: option, value: option }))} onResult={(value) => setFilters((current) => ({ ...current, language: value }))} />
                </div>
              </div>
            </FormFieldCard>
            <FormFieldCard>
              <FieldLabel label={t('doctors.consultationFee', 'Consultation fee')} icon={icons.fee} />
              <div className="relative">
                <select className="aid-input pr-14" value={filters.feeRange} onChange={(event) => setFilters((current) => ({ ...current, feeRange: event.target.value }))}>
                  {feeOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton options={feeOptions.map((option) => ({ label: option, value: option }))} onResult={(value) => setFilters((current) => ({ ...current, feeRange: value }))} />
                </div>
              </div>
            </FormFieldCard>
          </div>
        </div>

        <SupportNotice title={t('common.simpleTip', 'Simple tip')} text={`We found ${filteredDoctors.length} doctor${filteredDoctors.length === 1 ? '' : 's'}. Pick one and open the profile to see slots and the 15-minute consult option.`} />

        <div className="grid gap-4">
          {filteredDoctors.length === 0 ? (
            <div className="aid-card text-center">
              <p className="text-lg font-semibold">{t('doctors.noneFound', 'No doctors found with these filters.')}</p>
              <p className="mt-2 text-sm text-gray-500">{t('doctors.tryRemovingFilters', 'Try removing the language or fee filter.')}</p>
            </div>
          ) : null}
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="aid-card">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-950/40">
                    <svg className="h-10 w-10" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="17" r="8" stroke="currentColor" strokeWidth="2.5" /><path d="M12 38C14 29 34 29 36 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{doctor.name}</h3>
                      <SpeakerButton text={`${doctor.name}. ${doctor.specialization}. ${t('doctors.consultationFee', 'Consultation fee')}: Rs. ${doctor.fee}`} className="h-8 w-8" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{doctor.specialization}</p>
                    <p className="mt-1 text-sm text-gray-500">{doctor.city} | {doctor.experience} {t('doctors.yearsExperience', 'years experience')}</p>
                    <p className="mt-1 text-sm text-gray-500">{t('doctors.speaks', 'Speaks')}: {doctor.languages.join(', ')}</p>
                    <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-200">{t('doctors.consultationFee', 'Consultation fee')}: Rs. {doctor.fee}</p>
                  </div>
                </div>
                <Link to={`/doctors/${doctor.id}`} className="aid-btn-primary text-center">{t('doctors.seeDetails', 'See doctor details')}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default DoctorListPage;
