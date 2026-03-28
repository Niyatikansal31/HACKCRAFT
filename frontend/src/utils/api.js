import { queueRequest } from './offlineStore';
import BASE_URL from '../config/api';

function isMutation(method = 'GET') {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method).toUpperCase());
}

async function registerBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('aid-sync-queue');
    }
  } catch {
    // Background Sync not available/supported
  }
}

export async function apiRequest(path, options = {}) {
  let response;
  const method = String(options.method || 'GET').toUpperCase();
  const lowDataMode = document.documentElement.classList.contains('low-data-mode');

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Low-Data-Mode': lowDataMode ? '1' : '0',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    if (isMutation(method)) {
      const parsedBody = typeof options.body === 'string'
        ? (() => {
            try {
              return JSON.parse(options.body);
            } catch {
              return options.body;
            }
          })()
        : options.body;

      await queueRequest({
        url: `${BASE_URL}${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: parsedBody,
      });
      await registerBackgroundSync();
      return { success: true, queued: true, message: 'Saved offline. Will sync automatically when internet returns.' };
    }

    throw new Error('Unable to reach the server. You appear offline.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
