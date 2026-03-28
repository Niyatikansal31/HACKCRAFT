import { openDB } from 'idb';

const DB_NAME = 'aid_offline_db';
const DB_VERSION = 1;

const STORES = {
  snapshots: 'snapshots',
  queuedRequests: 'queued_requests',
  doctorContacts: 'doctor_contacts',
  offlineNotifications: 'offline_notifications',
};

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.snapshots)) {
        db.createObjectStore(STORES.snapshots, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.queuedRequests)) {
        db.createObjectStore(STORES.queuedRequests, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.doctorContacts)) {
        db.createObjectStore(STORES.doctorContacts, { keyPath: 'phone' });
      }
      if (!db.objectStoreNames.contains(STORES.offlineNotifications)) {
        db.createObjectStore(STORES.offlineNotifications, { keyPath: 'id' });
      }
    },
  });
}

export async function saveSnapshot(key, value) {
  const db = await getDb();
  await db.put(STORES.snapshots, { key, value, updatedAt: Date.now() });
}

export async function getSnapshot(key) {
  const db = await getDb();
  const data = await db.get(STORES.snapshots, key);
  return data?.value ?? null;
}

export async function queueRequest(request) {
  const db = await getDb();
  await db.put(STORES.queuedRequests, {
    id: request.id || `queue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    ...request,
  });
}

export async function getQueuedRequests() {
  const db = await getDb();
  return db.getAll(STORES.queuedRequests);
}

export async function removeQueuedRequest(id) {
  const db = await getDb();
  await db.delete(STORES.queuedRequests, id);
}

export async function saveDoctorContacts(contacts = []) {
  const db = await getDb();
  const tx = db.transaction(STORES.doctorContacts, 'readwrite');
  await Promise.all(
    contacts
      .filter((item) => item?.phone)
      .map((item) =>
        tx.store.put({
          phone: item.phone,
          name: item.name || 'Doctor',
          specialization: item.specialization || '',
          preferred: Boolean(item.preferred),
          updatedAt: Date.now(),
        }),
      ),
  );
  await tx.done;
}

export async function getDoctorContacts() {
  const db = await getDb();
  return db.getAll(STORES.doctorContacts);
}

export async function queueOfflineNotification(notification) {
  const db = await getDb();
  await db.put(STORES.offlineNotifications, {
    id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    delivered: false,
    ...notification,
  });
}

export async function getOfflineNotifications() {
  const db = await getDb();
  return db.getAll(STORES.offlineNotifications);
}

export async function removeOfflineNotification(id) {
  const db = await getDb();
  await db.delete(STORES.offlineNotifications, id);
}
