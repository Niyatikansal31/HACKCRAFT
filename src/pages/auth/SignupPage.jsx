import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import TermsModal from '../../components/auth/TermsModal';
import Toast from '../../components/ui/Toast';
import FormSection from '../../components/ui/FormSection';
import RoleSelectionCard from '../../components/layout/RoleSelectionCard';
import SupportNotice from '../../components/ui/SupportNotice';
import { useLanguage } from '../../hooks/useLanguage';
import { apiRequest } from '../../utils/api';
import { daysOfWeek, doctorLanguages, languageOptions, roleOptions, specializationOptions } from '../../utils/constants';

const reasonsByRole = {
  patient: ['General Consultation', 'Second Opinion', 'Chronic Disease Management', 'Mental Health', 'Emergency Care'],
  doctor: ['Offer Consultations', 'Part-time Practice', 'Telemedicine Only', 'Research'],
  chemist: ['List My Pharmacy', 'Accept Digital Prescriptions', 'Partner with Hospitals'],
};

const relationOptions = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const chemistServices = ['Home Delivery', '24x7', 'Generic Medicines', 'Prescription Required', 'OTC Available'];

const initialForm = {
  role: '',
  reasonForJoining: '',
  name: '',
  phone: '',
  city: '',
  email: '',
  password: '',
  repeatPassword: '',
  referrerCode: '',
  dateOfBirth: '',
  bloodGroup: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  preferredDoctorLanguage: '',
  medicalRegNumber: '',
  specialization: '',
  qualifications: '',
  experience: '',
  consultationFee: '',
  clinicName: '',
  availableLanguages: [],
  availabilitySlots: [],
  drugLicenseNumber: '',
  ownerName: '',
  servicesOffered: [],
  operatingOpen: '',
  operatingClose: '',
  latitude: '',
  longitude: '',
  acceptedTerms: false,
};

function ErrorText({ error }) {
  if (!error) return null;
  return <p className="mt-2 text-sm text-red-500">Warning: {error}</p>;
}

function SignupPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [termsOpen, setTermsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);

  const role = form.role;
  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const handleRoleSelect = (selectedRole) => {
    setErrors({});
    setForm({
      ...initialForm,
      role: selectedRole,
      phone: form.phone,
      email: form.email,
      city: form.city,
      referrerCode: form.referrerCode,
    });
  };

  const formTitle = useMemo(() => {
    if (role === 'doctor') return 'Enter doctor name';
    if (role === 'chemist') return 'Enter pharmacy / shop name';
    return 'Enter full name';
  }, [role]);

  const handleCheckboxGroup = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: current[name].includes(value) ? current[name].filter((item) => item !== value) : [...current[name], value],
    }));
  };

  const handleAvailability = (day, field, value) => {
    setForm((current) => {
      const existing = current.availabilitySlots.find((slot) => slot.day === day);
      let nextSlots = current.availabilitySlots;
      if (!existing) nextSlots = [...nextSlots, { day, startTime: '', endTime: '' }];
      nextSlots = nextSlots.map((slot) => (slot.day === day ? { ...slot, [field]: value } : slot));
      return { ...current, availabilitySlots: nextSlots };
    });
  };

  const toggleAvailabilityDay = (day) => {
    setForm((current) => {
      const exists = current.availabilitySlots.some((slot) => slot.day === day);
      return {
        ...current,
        availabilitySlots: exists ? current.availabilitySlots.filter((slot) => slot.day !== day) : [...current.availabilitySlots, { day, startTime: '09:00', endTime: '17:00' }],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    const phoneRegex = /^\d{10}$/;

    ['reasonForJoining', 'name', 'phone', 'city', 'email', 'password', 'repeatPassword'].forEach((field) => {
      if (!form[field]) nextErrors[field] = 'This field is required.';
    });

    if (!role) nextErrors.role = 'Please select a role.';
    if (!phoneRegex.test(form.phone)) nextErrors.phone = 'Phone number must be exactly 10 digits.';
    if (!emailRegex.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!passwordRegex.test(form.password)) nextErrors.password = 'Password must be 8+ characters with 1 uppercase and 1 number.';
    if (form.password !== form.repeatPassword) nextErrors.repeatPassword = 'Passwords do not match.';
    if (!form.acceptedTerms) nextErrors.acceptedTerms = 'You must accept the terms and conditions.';

    if (role === 'patient') {
      ['dateOfBirth', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation', 'preferredDoctorLanguage'].forEach((field) => {
        if (!form[field]) nextErrors[field] = 'This field is required.';
      });
      if (!phoneRegex.test(form.emergencyContactPhone)) nextErrors.emergencyContactPhone = 'Emergency contact phone must be 10 digits.';
    }

    if (role === 'doctor') {
      ['medicalRegNumber', 'specialization', 'qualifications', 'experience', 'consultationFee'].forEach((field) => {
        if (!form[field]) nextErrors[field] = 'This field is required.';
      });
      if (!form.availableLanguages.length) nextErrors.availableLanguages = 'Select at least one language.';
    }

    if (role === 'chemist') {
      ['drugLicenseNumber', 'ownerName', 'operatingOpen', 'operatingClose'].forEach((field) => {
        if (!form[field]) nextErrors[field] = 'This field is required.';
      });
      if (!form.servicesOffered.length) nextErrors.servicesOffered = 'Select at least one service.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      role,
      reasonForJoining: form.reasonForJoining,
      name: form.name,
      phone: form.phone,
      city: form.city,
      email: form.email,
      password: form.password,
      referrerCode: form.referrerCode,
      address: form.city,
      ...(role === 'patient' && {
        dateOfBirth: form.dateOfBirth,
        bloodGroup: form.bloodGroup,
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relation: form.emergencyContactRelation,
        },
        preferredDoctorLanguage: form.preferredDoctorLanguage,
        appLanguage: localStorage.getItem('preferred_language') || 'English',
      }),
      ...(role === 'doctor' && {
        medicalRegNumber: form.medicalRegNumber,
        specialization: form.specialization,
        qualifications: form.qualifications.split(',').map((item) => item.trim()).filter(Boolean),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        clinicName: form.clinicName,
        availableLanguages: form.availableLanguages,
        availabilitySlots: form.availabilitySlots,
      }),
      ...(role === 'chemist' && {
        shopName: form.name,
        ownerName: form.ownerName,
        licenseNumber: form.drugLicenseNumber,
        servicesOffered: form.servicesOffered,
        operatingHours: { open: form.operatingOpen, close: form.operatingClose },
        location:
          form.latitude && form.longitude
            ? { type: 'Point', coordinates: [Number(form.longitude), Number(form.latitude)] }
            : undefined,
      }),
    };

    try {
      setLoading(true);
      await apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      await apiRequest('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: form.phone, role }) });
      navigate('/verify-otp', { state: { phone: form.phone, role } });
    } catch (error) {
      setToast({ type: 'error', title: 'Registration failed', message: error.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const useLocationNow = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setField('latitude', position.coords.latitude.toFixed(6));
      setField('longitude', position.coords.longitude.toFixed(6));
    });
  };

  return (
    <AuthLayout title={t('auth.createYourAccount', 'Create Your Account')} subtitle={t('auth.chooseRoleSignup', 'Choose your role and set up your AID AI workspace.')}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

      <div className="grid gap-4 md:grid-cols-3">
        {roleOptions.map((option) => (
          <RoleSelectionCard
            key={option.id}
            role={option}
            selected={role === option.id}
            onSelect={handleRoleSelect}
            illustration={
              option.id === 'patient' ? (
                <svg viewBox="0 0 96 96" className="h-24 w-24 text-blue-600"><circle cx="48" cy="28" r="14" fill="currentColor" opacity="0.15" /><circle cx="48" cy="28" r="12" stroke="currentColor" strokeWidth="2.5" /><path d="M26 74C30 52 66 52 70 74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M12 52H28L34 44L42 60L52 34L60 52H84" stroke="#F87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              ) : option.id === 'doctor' ? (
                <svg viewBox="0 0 96 96" className="h-24 w-24 text-blue-600"><path d="M58 18C42 18 30 30 30 46C30 53 32 59 36 64L26 74L34 82L44 72C49 76 55 78 62 78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="64" cy="58" r="10" stroke="#F87171" strokeWidth="3" /><path d="M64 52V64" stroke="#F87171" strokeWidth="3" strokeLinecap="round" /><path d="M58 58H70" stroke="#F87171" strokeWidth="3" strokeLinecap="round" /></svg>
              ) : (
                <svg viewBox="0 0 96 96" className="h-24 w-24 text-blue-600"><rect x="24" y="24" width="48" height="52" rx="10" stroke="currentColor" strokeWidth="3" /><path d="M48 34V54" stroke="#F87171" strokeWidth="4" strokeLinecap="round" /><path d="M38 44H58" stroke="#F87171" strokeWidth="4" strokeLinecap="round" /><rect x="34" y="16" width="28" height="10" rx="5" fill="currentColor" opacity="0.2" /></svg>
              )
            }
          />
        ))}
      </div>
      <ErrorText error={errors.role} />
      {role ? (
        <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
          Selected role: {role === 'patient' ? 'Patient' : role === 'doctor' ? 'Doctor' : 'Chemist / Pharmacy'}
        </div>
      ) : null}

      {role ? (
        <form onSubmit={handleSubmit} className={`mt-8 space-y-6 ${shake ? 'animate-shake' : ''}`}>
          <SupportNotice title="Simple form" text="Fill the common details first. Then complete only the extra details for your selected role." />

          <FormSection title="Basic details" description="These details are needed for every account.">
            <div className="grid gap-5 md:grid-cols-2">
              <div><label className="mb-2 block font-medium">Reason for Joining *</label><select className="aid-input" value={form.reasonForJoining} onChange={(e) => setField('reasonForJoining', e.target.value)}><option value="">Select reason</option>{reasonsByRole[role].map((option) => <option key={option}>{option}</option>)}</select><ErrorText error={errors.reasonForJoining} /></div>
              <div><label className="mb-2 block font-medium">Name *</label><input className="aid-input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder={formTitle} /><ErrorText error={errors.name} /></div>
              <div><label className="mb-2 block font-medium">Phone Number *</label><div className="flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"><span className="flex items-center border-r border-gray-200 px-3 text-gray-500 dark:border-gray-700">+91</span><input className="w-full rounded-r-lg bg-transparent p-3 outline-none" value={form.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" /></div><ErrorText error={errors.phone} /></div>
              <div><label className="mb-2 block font-medium">City / Address *</label><input className="aid-input" value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Enter city and address" /><ErrorText error={errors.city} /></div>
              <div><label className="mb-2 block font-medium">Email *</label><input className="aid-input" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" /><ErrorText error={errors.email} /></div>
              <div><label className="mb-2 block font-medium">Password *</label><PasswordInput name="password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Create password" /><ErrorText error={errors.password} /></div>
              <div><label className="mb-2 block font-medium">Repeat Password *</label><PasswordInput name="repeatPassword" value={form.repeatPassword} onChange={(e) => setField('repeatPassword', e.target.value)} placeholder="Repeat password" /><ErrorText error={errors.repeatPassword} /></div>
              <div><label className="mb-2 block font-medium">Referrer Code</label><input className="aid-input" value={form.referrerCode} onChange={(e) => setField('referrerCode', e.target.value)} placeholder="Optional" /></div>
            </div>
          </FormSection>

          {role === 'patient' ? (
            <FormSection title="Patient details" description="These details help the doctor support you better.">
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="mb-2 block font-medium">Date of Birth *</label><input type="date" className="aid-input" value={form.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} /><ErrorText error={errors.dateOfBirth} /></div>
                <div><label className="mb-2 block font-medium">Blood Group</label><select className="aid-input" value={form.bloodGroup} onChange={(e) => setField('bloodGroup', e.target.value)}><option value="">Select group</option>{bloodGroups.map((group) => <option key={group}>{group}</option>)}</select></div>
                <div><label className="mb-2 block font-medium">Emergency Contact Name *</label><input className="aid-input" value={form.emergencyContactName} onChange={(e) => setField('emergencyContactName', e.target.value)} /><ErrorText error={errors.emergencyContactName} /></div>
                <div><label className="mb-2 block font-medium">Emergency Contact Phone *</label><input className="aid-input" value={form.emergencyContactPhone} onChange={(e) => setField('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} /><ErrorText error={errors.emergencyContactPhone} /></div>
                <div><label className="mb-2 block font-medium">Emergency Contact Relation *</label><select className="aid-input" value={form.emergencyContactRelation} onChange={(e) => setField('emergencyContactRelation', e.target.value)}><option value="">Select relation</option>{relationOptions.map((option) => <option key={option}>{option}</option>)}</select><ErrorText error={errors.emergencyContactRelation} /></div>
                <div><label className="mb-2 block font-medium">Preferred Language for Doctor *</label><select className="aid-input" value={form.preferredDoctorLanguage} onChange={(e) => setField('preferredDoctorLanguage', e.target.value)}><option value="">Select language</option>{languageOptions.map((option) => <option key={option.code} value={option.label}>{option.nativeLabel}</option>)}</select><ErrorText error={errors.preferredDoctorLanguage} /></div>
              </div>
            </FormSection>
          ) : null}

          {role === 'doctor' ? (
            <FormSection title="Doctor details" description="Add your medical and consultation details here.">
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div><label className="mb-2 block font-medium">Medical Registration Number *</label><input className="aid-input" value={form.medicalRegNumber} onChange={(e) => setField('medicalRegNumber', e.target.value)} /><ErrorText error={errors.medicalRegNumber} /></div>
                  <div><label className="mb-2 block font-medium">Specialization *</label><select className="aid-input" value={form.specialization} onChange={(e) => setField('specialization', e.target.value)}><option value="">Select specialization</option>{specializationOptions.map((option) => <option key={option}>{option}</option>)}</select><ErrorText error={errors.specialization} /></div>
                  <div><label className="mb-2 block font-medium">Qualifications *</label><input className="aid-input" value={form.qualifications} onChange={(e) => setField('qualifications', e.target.value)} placeholder="MBBS, MD" /><ErrorText error={errors.qualifications} /></div>
                  <div><label className="mb-2 block font-medium">Years of Experience *</label><input type="number" className="aid-input" value={form.experience} onChange={(e) => setField('experience', e.target.value)} /><ErrorText error={errors.experience} /></div>
                  <div><label className="mb-2 block font-medium">Consultation Fee (₹) *</label><input type="number" className="aid-input" value={form.consultationFee} onChange={(e) => setField('consultationFee', e.target.value)} /><ErrorText error={errors.consultationFee} /></div>
                  <div><label className="mb-2 block font-medium">Clinic Name</label><input className="aid-input" value={form.clinicName} onChange={(e) => setField('clinicName', e.target.value)} /></div>
                </div>
                <div>
                  <label className="mb-3 block font-medium">Available Languages *</label>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {doctorLanguages.map((language) => <label key={language} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-700"><input type="checkbox" checked={form.availableLanguages.includes(language)} onChange={() => handleCheckboxGroup('availableLanguages', language)} /><span>{language}</span></label>)}
                  </div>
                  <ErrorText error={errors.availableLanguages} />
                </div>
                <div>
                  <label className="mb-3 block font-medium">Availability</label>
                  <div className="space-y-3">
                    {daysOfWeek.map((day) => {
                      const slot = form.availabilitySlots.find((item) => item.day === day);
                      return <div key={day} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><label className="flex items-center gap-3 font-medium"><input type="checkbox" checked={Boolean(slot)} onChange={() => toggleAvailabilityDay(day)} /><span>{day}</span></label>{slot ? <div className="flex gap-3"><input type="time" className="aid-input max-w-[150px]" value={slot.startTime} onChange={(e) => handleAvailability(day, 'startTime', e.target.value)} /><input type="time" className="aid-input max-w-[150px]" value={slot.endTime} onChange={(e) => handleAvailability(day, 'endTime', e.target.value)} /></div> : null}</div></div>;
                    })}
                  </div>
                </div>
              </div>
            </FormSection>
          ) : null}

          {role === 'chemist' ? (
            <FormSection title="Pharmacy details" description="Add your pharmacy details and nearby services.">
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div><label className="mb-2 block font-medium">Drug License Number *</label><input className="aid-input" value={form.drugLicenseNumber} onChange={(e) => setField('drugLicenseNumber', e.target.value)} /><ErrorText error={errors.drugLicenseNumber} /></div>
                  <div><label className="mb-2 block font-medium">Owner Name *</label><input className="aid-input" value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} /><ErrorText error={errors.ownerName} /></div>
                  <div><label className="mb-2 block font-medium">Operating Open *</label><input type="time" className="aid-input" value={form.operatingOpen} onChange={(e) => setField('operatingOpen', e.target.value)} /><ErrorText error={errors.operatingOpen} /></div>
                  <div><label className="mb-2 block font-medium">Operating Close *</label><input type="time" className="aid-input" value={form.operatingClose} onChange={(e) => setField('operatingClose', e.target.value)} /><ErrorText error={errors.operatingClose} /></div>
                </div>
                <div><label className="mb-3 block font-medium">Services Offered *</label><div className="grid gap-3 md:grid-cols-2">{chemistServices.map((service) => <label key={service} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-700"><input type="checkbox" checked={form.servicesOffered.includes(service)} onChange={() => handleCheckboxGroup('servicesOffered', service)} /><span>{service}</span></label>)}</div><ErrorText error={errors.servicesOffered} /></div>
                <div className="grid gap-5 md:grid-cols-2"><input className="aid-input" value={form.latitude} onChange={(e) => setField('latitude', e.target.value)} placeholder="Latitude" /><input className="aid-input" value={form.longitude} onChange={(e) => setField('longitude', e.target.value)} placeholder="Longitude" /></div>
                <button type="button" onClick={useLocationNow} className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600">Use My Location</button>
              </div>
            </FormSection>
          ) : null}

          <FormSection title="Final step" description="Review and accept the terms before creating your account.">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={form.acceptedTerms} onChange={(e) => setField('acceptedTerms', e.target.checked)} className="mt-1" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                I accept the{' '}
                <button type="button" onClick={() => setTermsOpen(true)} className="font-semibold text-blue-600">Terms and Conditions</button>
              </span>
            </label>
            <ErrorText error={errors.acceptedTerms} />
            <button type="submit" disabled={loading} className="aid-btn-accent mt-5 w-full">{loading ? 'Please wait...' : 'Create Account'}</button>
          </FormSection>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600">Login here</Link>
          </p>
        </form>
      ) : null}
    </AuthLayout>
  );
}

export default SignupPage;
