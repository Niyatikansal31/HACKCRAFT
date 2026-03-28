import { useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import FieldLabel from '../components/ui/FieldLabel';
import FormFieldCard from '../components/ui/FormFieldCard';
import SpeakerButton from '../components/ui/SpeakerButton';
import VoiceInputButton from '../components/ui/VoiceInputButton';
import { useLanguage } from '../hooks/useLanguage';

const symptomInsights = {
  fever: [
    { label: 'Viral Fever', value: 82, note: 'Common when fever is recent and paired with fatigue or body ache.' },
    { label: 'Seasonal Flu', value: 69, note: 'More likely when sore throat, cough, and chills are present.' },
    { label: 'Mild Dehydration', value: 34, note: 'Hydration and temperature monitoring are important.' },
  ],
  cough: [
    { label: 'Upper Respiratory Infection', value: 79, note: 'Typical when cough is short duration with throat irritation.' },
    { label: 'Seasonal Allergy', value: 58, note: 'Consider if symptoms worsen around dust, pollen, or weather change.' },
    { label: 'Bronchitis', value: 41, note: 'Follow up if cough is persistent or chest discomfort develops.' },
  ],
  chest: [
    { label: 'Needs Urgent Review', value: 91, note: 'Chest symptoms can be serious. Use the SOS panel if pain is intense or breathing is difficult.' },
    { label: 'Acid Reflux', value: 46, note: 'Possible if symptoms follow meals or lying down.' },
    { label: 'Muscle Strain', value: 31, note: 'Sometimes linked to recent exertion or coughing.' },
  ],
  default: [
    { label: 'General Physician Review', value: 66, note: 'A general consultation is the safest first step for unclear symptoms.' },
    { label: 'Hydration and Rest', value: 49, note: 'Supportive care helps while monitoring progression.' },
    { label: 'Follow-up Needed', value: 28, note: 'Seek medical advice if symptoms worsen or persist.' },
  ],
};

const icons = {
  symptom: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 4V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  time: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  notes: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M7 5H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 10H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 15H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

function SymptomCheckerPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    symptom: '',
    duration: t('symptom.oneToThreeDays', '1-3 days'),
    severity: 'mild',
    notes: '',
  });

  const resultSet = useMemo(() => {
    const symptom = form.symptom.toLowerCase();
    if (symptom.includes('chest') || symptom.includes('breath')) return symptomInsights.chest;
    if (symptom.includes('fever')) return symptomInsights.fever;
    if (symptom.includes('cough')) return symptomInsights.cough;
    return symptomInsights.default;
  }, [form.symptom]);

  const urgencyMessage = useMemo(() => {
    if (form.severity === 'severe' || resultSet[0]?.label === 'Needs Urgent Review') {
      return 'This symptom pattern looks higher risk. Please use Emergency support if symptoms are worsening now.';
    }
    if (form.duration === t('symptom.moreThanThreeDays', 'More than 3 days')) {
      return 'Persistent symptoms should be reviewed by a doctor soon, even if they seem manageable.';
    }
    return 'This looks suitable for a normal doctor consultation and home monitoring.';
  }, [form.duration, form.severity, resultSet, t]);

  const canAdvance = (step === 1 && form.symptom.trim()) || step === 2 || step === 3;

  return (
    <AppShell>
      <PageHeader
        title={t('dashboard.aiSymptomChecker', 'AI Symptom Checker')}
        description={t('dashboard.aiSymptomCheckerDesc', 'Answer a few guided questions and review likely conditions with confidence bars.')}
        breadcrumb="Dashboard / Symptom Checker"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="38" y="24" width="144" height="132" rx="24" fill="#DBEAFE" /><rect x="58" y="44" width="104" height="92" rx="16" fill="white" /><path d="M80 88H140" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><path d="M110 58V118" stroke="#F87171" strokeWidth="8" strokeLinecap="round" /></svg>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="aid-card">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{t('symptom.step', 'Step')} {step} {t('symptom.of', 'of')} 3</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <span key={item} className={`h-2.5 w-10 rounded-full ${item <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
          </div>

          {step === 1 ? (
            <FormFieldCard>
              <FieldLabel label={t('symptom.primary', 'Primary symptom')} icon={icons.symptom} />
              <div className="relative">
                <input
                  className="aid-input pr-14"
                  value={form.symptom}
                  onChange={(event) => setForm((current) => ({ ...current, symptom: event.target.value }))}
                  placeholder={t('symptom.primaryPlaceholder', 'e.g. fever, cough, chest pain, rash')}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={(value) => setForm((current) => ({ ...current, symptom: value }))} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Fever', 'Cough', 'Chest Pain', 'Rash', 'Headache'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, symptom: item }))}
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </FormFieldCard>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <FormFieldCard>
                <FieldLabel label={t('symptom.duration', 'Duration')} icon={icons.time} />
                <div className="relative">
                  <select className="aid-input pr-14" value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}>
                    {[t('symptom.lessThan24', 'Less than 24 hours'), t('symptom.oneToThreeDays', '1-3 days'), t('symptom.moreThanThreeDays', 'More than 3 days')].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInputButton options={[t('symptom.lessThan24', 'Less than 24 hours'), t('symptom.oneToThreeDays', '1-3 days'), t('symptom.moreThanThreeDays', 'More than 3 days')].map((option) => ({ label: option, value: option }))} onResult={(value) => setForm((current) => ({ ...current, duration: value }))} />
                  </div>
                </div>
              </FormFieldCard>
              <FormFieldCard>
                <FieldLabel label={t('symptom.severity', 'Severity')} icon={icons.symptom} />
                <div className="relative">
                  <select className="aid-input pr-14" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}>
                    <option value="mild">{t('symptom.mild', 'Mild')}</option>
                    <option value="moderate">{t('symptom.moderate', 'Moderate')}</option>
                    <option value="severe">{t('symptom.severe', 'Severe')}</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      options={[
                        { label: t('symptom.mild', 'Mild'), value: 'mild' },
                        { label: t('symptom.moderate', 'Moderate'), value: 'moderate' },
                        { label: t('symptom.severe', 'Severe'), value: 'severe' },
                      ]}
                      onResult={(value) => setForm((current) => ({ ...current, severity: value }))}
                    />
                  </div>
                </div>
              </FormFieldCard>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <FormFieldCard>
                <FieldLabel label={t('symptom.extraNotes', 'Extra notes')} icon={icons.notes} />
                <div className="relative">
                  <textarea
                    className="aid-input min-h-32 pr-14"
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder={t('symptom.extraNotesPlaceholder', 'Mention fever, allergies, breathing difficulty, pain location, or anything else important')}
                  />
                  <div className="absolute right-2 top-2">
                    <VoiceInputButton onResult={(value) => setForm((current) => ({ ...current, notes: value }))} />
                  </div>
                </div>
              </FormFieldCard>
              <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                {t('symptom.triageNote', 'AID AI is a triage assistant, not a diagnosis. Use Emergency support for sudden severe symptoms.')}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 1))} disabled={step === 1} className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200">
              {t('common.back', 'Back')}
            </button>
            <button type="button" onClick={() => setStep((current) => Math.min(current + 1, 3))} disabled={!canAdvance || step === 3} className="aid-btn-primary w-full disabled:opacity-50">
              {t('common.next', 'Next')}
            </button>
          </div>
        </div>

        <div className="aid-card">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{t('symptom.aiResultPanel', 'AI Result Panel')}</h3>
              <SpeakerButton text={`${t('symptom.aiResultPanel', 'AI Result Panel')}. ${urgencyMessage}`} />
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${form.severity === 'severe' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200'}`}>
              {form.severity.charAt(0).toUpperCase() + form.severity.slice(1)} {t('symptom.urgencyContext', 'urgency context')}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{urgencyMessage}</p>
          <div className="mt-6 space-y-5">
            {resultSet.map((result) => (
              <div key={result.label} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{result.label}</p>
                    <SpeakerButton text={`${result.label}. ${result.note}`} className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-gray-500">{result.value}%</p>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-3 rounded-full ${result.value > 80 ? 'bg-red-500' : result.value > 60 ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${result.value}%` }} />
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{result.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default SymptomCheckerPage;
