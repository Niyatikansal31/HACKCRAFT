export const APP_NAME = 'AID AI';
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const roleOptions = [
  {
    id: 'patient',
    titleKey: 'role.patient.title',
    subtitleKey: 'role.patient.subtitle',
    title: "I'm a Patient",
    subtitle: 'Find doctors, check symptoms, manage health',
  },
  {
    id: 'doctor',
    titleKey: 'role.doctor.title',
    subtitleKey: 'role.doctor.subtitle',
    title: "I'm a Doctor",
    subtitle: 'Offer consultations, manage appointments',
  },
  {
    id: 'chemist',
    titleKey: 'role.chemist.title',
    subtitleKey: 'role.chemist.subtitle',
    title: "I'm a Chemist",
    subtitle: 'List your pharmacy, accept prescriptions',
  },
];

export const languageOptions = [
  { code: 'en', label: 'English', nativeLabel: 'English', bcp47: 'en-IN', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', bcp47: 'hi-IN', dir: 'ltr' },
];

export const languageCodeMap = Object.fromEntries(languageOptions.map((option) => [option.code, option]));

export const doctorLanguages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Odia'];

export const specializationOptions = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'Neurologist',
  'ENT',
  'Ophthalmologist',
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const emergencyConditions = [
  'Chest Pain',
  'Difficulty Breathing',
  'Seizure',
  'Bleeding',
  'Unconscious',
  'Stroke',
  'Poisoning',
  'Burn',
  'Choking',
  'Other',
];
