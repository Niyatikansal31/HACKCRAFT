import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';
import EmergencyButton from '../emergency/EmergencyButton';
import EmergencyModal from '../emergency/EmergencyModal';
import { useAuth } from '../../hooks/useAuth';
import OfflineBanner from './OfflineBanner';

function AppShell({ children }) {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const showEmergency = user?.role === 'patient';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <OfflineBanner />
      <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 pb-10 pt-6 lg:px-6">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} onEmergency={() => setEmergencyOpen(true)} />
        <main className="min-h-[calc(100vh-8rem)] flex-1 animate-fadeIn">{children}</main>
      </div>
      <ChatBot onOpenEmergency={() => setEmergencyOpen(true)} />
      {showEmergency ? <EmergencyButton onClick={() => setEmergencyOpen(true)} /> : null}
      {showEmergency ? <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} /> : null}
    </div>
  );
}

export default AppShell;
