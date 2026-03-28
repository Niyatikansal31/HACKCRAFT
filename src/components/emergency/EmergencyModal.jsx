import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import AmbulanceCard from './AmbulanceCard';
import { apiRequest } from '../../utils/api';
import { useEmergency } from '../../hooks/useEmergency';
import { useLanguage } from '../../hooks/useLanguage';
import { useConnectivity } from '../../hooks/useConnectivity';
import SpeakerButton from '../ui/SpeakerButton';

function EmergencyModal({ open, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOnline } = useConnectivity();
  const { emergencyConditions, selectedCondition, setSelectedCondition, firstAidTips } = useEmergency();
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [city, setCity] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!open) return;

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const data = await apiRequest('/api/emergency/online-doctors');
        setDoctors(data.doctors || []);
      } catch {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const loadServices = async (lat, lng) => {
      try {
        setLoadingServices(true);
        const data = await apiRequest(`/api/emergency/nearby-services?lat=${lat}&lng=${lng}`);
        setServices(data.services || []);
      } catch {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadDoctors();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError('');
          loadServices(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocationError(t('emergency.locationDenied', 'Location access was denied. Enter your city to find nearby support.'));
          setLoadingServices(false);
        },
      );
    } else {
      setLocationError(t('emergency.locationUnsupported', 'Geolocation is not supported on this device.'));
    }
  }, [open, t]);

  const serviceCards = useMemo(() => services.slice(0, 3), [services]);

  const shareLocally = async () => {
    const localMessage = 'Patient details: Name, symptoms, and basic health details for emergency local transfer.';
    try {
      if (navigator.bluetooth?.requestDevice) {
        await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: 'AID AI Emergency Local Share', text: localMessage });
        return;
      }
      alert('Bluetooth/WiFi Direct sharing is not supported on this device. Please use phone call/SMS fallback.');
    } catch {
      // User canceled or unsupported
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('emergency.panelTitle', 'Emergency Support Panel')} size="max-w-6xl">
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="aid-card bg-blue-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('emergency.instantDoctor', 'Instant Doctor Connect')}</h3>
            <SpeakerButton text={`${t('emergency.instantDoctor', 'Instant Doctor Connect')}. ${t('emergency.instantDoctorDesc', 'Get connected to online clinicians immediately.')}`} />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('emergency.instantDoctorDesc', 'Get connected to online clinicians immediately.')}</p>
          <div className="mt-6 space-y-4">
            {loadingDoctors ? <Spinner label="Checking online doctors..." /> : null}
            {!loadingDoctors && doctors.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">{t('emergency.noDoctors', 'No doctors currently online, calling emergency line is recommended.')}</p>
            ) : null}
            {doctors.map((doctor) => (
              <AmbulanceCard
                key={doctor.id}
                type="doctor"
                title={doctor.name}
                subtitle={doctor.specialization}
                meta="Online"
                actionLabel={t('emergency.connectNow', 'Connect Now')}
                onAction={() => {
                  onClose();
                  navigate(`/consultation/${doctor.id}`);
                }}
              />
            ))}
          </div>
        </section>

        <section className="aid-card">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('emergency.nearbyServices', 'Nearby Ambulance / Health Services')}</h3>
            <SpeakerButton text={`${t('emergency.nearbyServices', 'Nearby Ambulance / Health Services')}. ${t('emergency.nearbyServicesDesc', 'Fast access to pharmacies, clinics, and hospitals around you.')}`} />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('emergency.nearbyServicesDesc', 'Fast access to pharmacies, clinics, and hospitals around you.')}</p>
          <div className="mt-6 space-y-4">
            {loadingServices ? <Spinner label={t('emergency.findingServices', 'Finding nearby services...')} /> : null}
            {locationError ? (
              <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-orange-700 dark:text-orange-200">{locationError}</p>
                  <SpeakerButton text={locationError} className="h-8 w-8" />
                </div>
                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={t('emergency.cityManual', 'Enter city manually')} className="aid-input" />
              </div>
            ) : null}
            {serviceCards.map((service, index) => (
              <AmbulanceCard
                key={`${service.name}-${index}`}
                type="service"
                title={service.name}
                subtitle={`${service.address} • ${service.distance || 'Nearby'}`}
                phone={service.phone}
                actionLabel={t('emergency.callNow', 'Call Now')}
                onAction={() => {
                  window.location.href = `tel:${service.phone}`;
                }}
              />
            ))}
          </div>
        </section>

        <section className="aid-card">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('emergency.firstAid', 'First Aid Tips')}</h3>
            <SpeakerButton text={`${t('emergency.firstAid', 'First Aid Tips')}. ${t('emergency.firstAidDesc', 'Tap the closest symptom to get calm, immediate guidance.')}`} />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('emergency.firstAidDesc', 'Tap the closest symptom to get calm, immediate guidance.')}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {emergencyConditions.map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => setSelectedCondition(condition)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCondition === condition
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {firstAidTips.map((tip) => (
              <li key={tip} className="flex gap-3 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-800">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
                <div className="flex items-start gap-2">
                  <span>{tip}</span>
                  <SpeakerButton text={tip} className="h-8 w-8" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href="tel:112" className="flex-1 rounded-2xl bg-red-500 px-6 py-4 text-center font-semibold text-white">
          {t('emergency.call112', 'Call 112')}
        </a>
        <a href="tel:1800000000" className="flex-1 rounded-2xl bg-[#F87171] px-6 py-4 text-center font-semibold text-white">
          {t('emergency.callHelpline', 'Call 1800-XXX (AID AI Helpline)')}
        </a>
      </div>
      {!isOnline ? (
        <div className="mt-3 rounded-2xl bg-blue-50 p-4 text-sm dark:bg-blue-950/30">
          <p className="font-semibold text-blue-700 dark:text-blue-200">No Internet: Local Communication Fallback</p>
          <p className="mt-1 text-blue-700 dark:text-blue-200">Use Bluetooth / nearby sharing to send patient basic details to doctor devices in the same clinic.</p>
          <button type="button" onClick={shareLocally} className="aid-btn-primary mt-3 w-full">
            Share via Bluetooth / Nearby
          </button>
        </div>
      ) : null}
    </Modal>
  );
}

export default EmergencyModal;
