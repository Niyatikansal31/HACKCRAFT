import { useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import SpeakerButton from '../components/ui/SpeakerButton';
import { useLanguage } from '../hooks/useLanguage';
import { saveSnapshot } from '../utils/offlineStore';

function PrescriptionsPage() {
  const { t } = useLanguage();
  const prescriptions = ['Amoxicillin', 'Vitamin D3', 'Topical Cream'];
  useEffect(() => {
    saveSnapshot(
      'prescriptions',
      prescriptions.map((medicine) => ({
        medicine,
        date: '26 Mar 2026',
      })),
    );
  }, []);

  return (
    <AppShell>
      <PageHeader
        title={t('common.prescriptions', 'Prescriptions')}
        description={t('dashboard.prescriptionsDesc', 'Review active medicines, dosage notes, and downloadable records.')}
        breadcrumb="Dashboard / Prescriptions"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="58" y="20" width="104" height="140" rx="18" fill="#DBEAFE" /><path d="M84 56H136" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path d="M84 88H136" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /><path d="M84 120H122" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round" /></svg>}
      />
      <div className="aid-card overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-4">{t('prescriptions.doctor', 'Doctor')}</th>
              <th className="pb-4">{t('prescriptions.medicine', 'Medicine')}</th>
              <th className="pb-4">{t('prescriptions.date', 'Date')}</th>
              <th className="pb-4">{t('prescriptions.download', 'Download')}</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((medicine, index) => (
              <tr key={medicine} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-4">Dr. Sample {index + 1}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span>{medicine}</span>
                    <SpeakerButton text={`${medicine}. Take as prescribed.`} className="h-8 w-8" />
                  </div>
                </td>
                <td className="py-4">26 Mar 2026</td>
                <td className="py-4"><button type="button" className="text-blue-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 11L12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export default PrescriptionsPage;
