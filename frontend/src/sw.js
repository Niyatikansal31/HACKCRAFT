/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { openDB } from 'idb';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'aid-pages',
    networkTimeoutSeconds: 3,
  }),
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({ cacheName: 'aid-assets' }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'aid-api',
    networkTimeoutSeconds: 2,
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'aid-images',
  }),
);

const QUEUE_DB = 'aid_offline_db';
const QUEUE_STORE = 'queued_requests';

async function readQueuedRequests() {
  const db = await openDB(QUEUE_DB, 1);
  return db.getAll(QUEUE_STORE);
}

async function removeQueuedRequest(id) {
  const db = await openDB(QUEUE_DB, 1);
  await db.delete(QUEUE_STORE, id);
}

async function replayQueuedRequests() {
  const requests = await readQueuedRequests();
  for (const item of requests) {
    try {
      await fetch(item.url, {
        method: item.method || 'POST',
        headers: item.headers || { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      await removeQueuedRequest(item.id);
    } catch {
      // Keep queued item for next sync cycle
    }
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'aid-sync-queue') {
    event.waitUntil(replayQueuedRequests());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'AID_REPLAY_QUEUE') {
    replayQueuedRequests();
  }
});
