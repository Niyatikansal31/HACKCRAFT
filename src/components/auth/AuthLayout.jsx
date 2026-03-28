import { useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import { APP_NAME } from '../../utils/constants';
import SupportNotice from '../ui/SupportNotice';
import DoctorHelpIllustration from '../illustrations/DoctorHelpIllustration';
import { useLanguage } from '../../hooks/useLanguage';
import { useAutoRead } from '../../hooks/useAutoRead';
import { useTTS } from '../../hooks/useTTS';
import SpeakerButton from '../ui/SpeakerButton';

function Logo() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L38 9.5V23.5C38 32.2 32.1 40.1 24 43.5C15.9 40.1 10 32.2 10 23.5V9.5L24 4Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
        <path d="M24 14V29" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
        <path d="M16.5 21.5H31.5" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-blue-600">{APP_NAME}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.tagline', 'Easy health support for every family')}</p>
      </div>
    </div>
  );
}

function AuthLayout({ title, subtitle, children }) {
  const { t } = useLanguage();
  const { autoReadMode } = useAutoRead();
  const { speak } = useTTS();

  useEffect(() => {
    if (autoReadMode) {
      speak(`${title}. ${subtitle || ''}`);
    }
  }, [autoReadMode, speak, subtitle, title]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 px-4 py-6 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <Logo />
          <LanguageSelector />
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl lg:block dark:border-gray-800 dark:bg-gray-900">
            <div className="max-w-lg space-y-5">
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{t('common.simpleAndGuided', 'Simple and guided')}</span>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">{t('auth.keepEveryStepEasy', 'We keep every step easy to understand.')}</h1>
                <SpeakerButton text={`${t('auth.keepEveryStepEasy', 'We keep every step easy to understand.')}. ${t('auth.chooseRoleFillNeeded', 'Choose your role, fill only the needed details, and move ahead one clear step at a time.')}`} />
              </div>
              <p className="text-base text-gray-600 dark:text-gray-300">{t('auth.chooseRoleFillNeeded', 'Choose your role, fill only the needed details, and move ahead one clear step at a time.')}</p>
            </div>
            <div className="mt-8">
              <DoctorHelpIllustration className="w-full" />
            </div>
            <div className="mt-6 space-y-3">
              <SupportNotice title={t('common.needHelp', 'Need help?')} text={t('auth.familyCanHelp', 'A family member or local volunteer can help fill this form. The steps are short and safe to review before submitting.')} />
              <SupportNotice title={t('common.phoneFirst', 'Phone first')} text={t('auth.phoneMainLogin', 'Your phone number is the main login method, so keep it active for OTP verification.')} tone="green" />
            </div>
          </div>

          <div className="animate-fadeIn rounded-[2rem] border border-gray-200 bg-white p-5 shadow-lg sm:p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <SpeakerButton text={`${title}. ${subtitle}`} />
              </div>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Logo };
export default AuthLayout;
