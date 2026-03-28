import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import CommunityCareIllustration from '../components/illustrations/CommunityCareIllustration';
import SupportNotice from '../components/ui/SupportNotice';

function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="animate-fadeIn bg-white dark:bg-gray-950">
      <section className="border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-orange-50 px-4 py-14 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-2">
          <div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{t('trustedPlatform', 'AI-powered Telemedicine Platform')}</span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl">{t('healthcareAtYourFingertips', 'Healthcare at Your Fingertips')}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">{t('heroText', 'AID AI brings consultations, prescriptions, emergency support, and pharmacy access into one elegant care experience for patients, doctors, and chemists.')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="aid-btn-primary text-center text-lg">
                {t('getStarted', 'Get Started')}
              </Link>
              <Link to="/doctors" className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-200">
                {t('landing.findDoctorCta', 'Find a Doctor')}
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SupportNotice title={t('landing.easySignupTitle', 'Easy signup')} text={t('landing.easySignupText', 'Phone-based login and clear steps.')} />
              <SupportNotice title={t('landing.fastConsultTitle', 'Fast consult')} text={t('landing.fastConsultText', 'Book a doctor or request a 15-minute consult.')} tone="green" />
              <SupportNotice title={t('landing.emergencyHelpTitle', 'Emergency help')} text={t('landing.emergencyHelpText', 'Open SOS anytime for urgent support.')} tone="amber" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CommunityCareIllustration className="w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['1', t('landing.step1Title', 'Create account'), t('landing.step1Text', 'Choose patient, doctor, or chemist and verify with OTP.')],
            ['2', t('landing.step2Title', 'Get help fast'), t('landing.step2Text', 'Use symptom checker or find a doctor by language and fee.')],
            ['3', t('landing.step3Title', 'Consult safely'), t('landing.step3Text', 'Pay, join the consultation, and keep records in one place.')],
          ].map(([number, title, text]) => (
            <div key={title} className="aid-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{number}</div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="aid-card bg-blue-600 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">{t('landing.trustedFamilies', 'Trusted by families')}</p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-4xl font-extrabold">10,000+</p>
                <p className="text-blue-100">{t('landing.patientsSupported', 'Patients supported')}</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold">500+</p>
                <p className="text-blue-100">{t('landing.doctorsAvailable', 'Doctors available')}</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold">24/7</p>
                <p className="text-blue-100">{t('landing.emergencySupport', 'Emergency support')}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              [t('landing.localLanguageTitle', 'Local language support'), t('landing.localLanguageText', 'Choose your preferred language and find doctors who speak it.')],
              [t('landing.quickConsultTitle', '15-minute doctor consult'), t('landing.quickConsultText', 'Need quick care? Ask for a fast consultation from the doctor profile.')],
              [t('landing.simplePaymentTitle', 'Simple payment flow'), t('landing.simplePaymentText', 'Book first, pay next, then join the consultation from appointments.')],
              [t('landing.sosPanelTitle', 'SOS emergency panel'), t('landing.sosPanelText', 'Get nearby services, online doctors, and first-aid tips in one place.')],
            ].map(([title, text]) => (
              <div key={title} className="aid-card">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
