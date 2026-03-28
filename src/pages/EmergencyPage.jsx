import { useEffect, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import EmergencyModal from '../components/emergency/EmergencyModal';

function EmergencyPage() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <AppShell>
      <div className="rounded-[2rem] bg-red-500 p-8 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-red-100">Dashboard / Emergency</p>
        <h1 className="mt-4 text-4xl font-extrabold">Emergency Access</h1>
        <p className="mt-4 max-w-2xl text-red-50">Immediate access to online doctors, nearby services, and first-aid guidance.</p>
        <button type="button" onClick={() => setOpen(true)} className="mt-8 rounded-2xl bg-white px-8 py-5 text-xl font-bold text-red-500">Open SOS Panel</button>
      </div>
      <EmergencyModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}

export default EmergencyPage;
