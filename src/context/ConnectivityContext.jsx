import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../utils/api';
import {
  getOfflineNotifications,
  getQueuedRequests,
  queueOfflineNotification,
  removeOfflineNotification,
  removeQueuedRequest,
} from '../utils/offlineStore';

export const ConnectivityContext = createContext(null);

function readConnection() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType || 'unknown';
  const downlink = connection?.downlink || 0;
  const rtt = connection?.rtt || 0;
  const saveData = Boolean(connection?.saveData);
  return { effectiveType, downlink, rtt, saveData };
}

function toStrength(effectiveType, downlink) {
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.6) return 'Poor';
  if (effectiveType === '3g' || downlink < 1.5) return 'Fair';
  if (effectiveType === '4g' || downlink >= 1.5) return 'Good';
  return 'Unknown';
}

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState(readConnection());
  const [lowDataMode, setLowDataMode] = useState(localStorage.getItem('aid_low_data_mode') === 'true');

  const autoLowData = ['slow-2g', '2g'].includes(connection.effectiveType) || connection.saveData;
  const effectiveLowDataMode = lowDataMode || autoLowData;

  const toggleLowDataMode = useCallback(() => {
    setLowDataMode((current) => {
      const next = !current;
      localStorage.setItem('aid_low_data_mode', String(next));
      return next;
    });
  }, []);

  const flushQueuedRequests = useCallback(async () => {
    const queued = await getQueuedRequests();
    for (const item of queued) {
      try {
        await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || { 'Content-Type': 'application/json' },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });
        await removeQueuedRequest(item.id);
      } catch {
        // Keep queued until next restore
      }
    }
  }, []);

  const flushOfflineNotifications = useCallback(async () => {
    const notifications = await getOfflineNotifications();
    for (const item of notifications) {
      try {
        await apiRequest('/api/communication/notify', {
          method: 'POST',
          body: JSON.stringify(item),
        });
        await removeOfflineNotification(item.id);
      } catch {
        // Keep local item for later retries
      }
    }
  }, []);

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    const updateConnection = () => setConnection(readConnection());

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    (navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.addEventListener?.('change', updateConnection);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
      (navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.removeEventListener?.('change', updateConnection);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('low-data-mode', effectiveLowDataMode);
    if (effectiveLowDataMode) {
      document.querySelectorAll('img').forEach((img) => {
        if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      });
    }
  }, [effectiveLowDataMode]);

  useEffect(() => {
    if (!isOnline) return;
    flushQueuedRequests();
    flushOfflineNotifications();
  }, [flushOfflineNotifications, flushQueuedRequests, isOnline]);

  const queueCriticalNotification = useCallback(async (notification) => {
    await queueOfflineNotification(notification);
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      connection,
      networkStrength: toStrength(connection.effectiveType, connection.downlink),
      lowDataMode: effectiveLowDataMode,
      lowDataManual: lowDataMode,
      toggleLowDataMode,
      queueCriticalNotification,
      flushQueuedRequests,
    }),
    [connection, effectiveLowDataMode, flushQueuedRequests, isOnline, lowDataMode, queueCriticalNotification, toggleLowDataMode],
  );

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}
