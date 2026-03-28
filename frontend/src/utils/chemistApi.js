import { apiRequest } from './api';

function authHeaders() {
  const token = localStorage.getItem('aid_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getChemistProfile() {
  return apiRequest('/api/chemist/profile', { headers: authHeaders() });
}

export function updateChemistProfile(payload) {
  return apiRequest('/api/chemist/profile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getChemistInventory(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/api/chemist/inventory${query ? `?${query}` : ''}`, { headers: authHeaders() });
}

export function createChemistInventoryItem(payload) {
  return apiRequest('/api/chemist/inventory', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateChemistInventoryItem(id, payload) {
  return apiRequest(`/api/chemist/inventory/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteChemistInventoryItem(id) {
  return apiRequest(`/api/chemist/inventory/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export function getChemistCatalogue(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/api/chemist/catalogue${query ? `?${query}` : ''}`, { headers: authHeaders() });
}

export function getChemistOrders(tab = 'all') {
  return apiRequest(`/api/chemist/orders?tab=${tab}`, { headers: authHeaders() });
}

export function createChemistOrder(payload) {
  return apiRequest('/api/chemist/orders', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateChemistOrderStatus(id, status) {
  return apiRequest(`/api/chemist/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export function cancelChemistOrder(id, reason) {
  return apiRequest(`/api/chemist/orders/${id}/cancel`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
}

export function reviewChemistPrescription(id, action, reason = '') {
  return apiRequest(`/api/chemist/orders/${id}/prescription`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ action, reason }),
  });
}

export function getChemistEarnings(view = 'daily') {
  return apiRequest(`/api/chemist/earnings?view=${view}`, { headers: authHeaders() });
}

export function getChemistReports() {
  return apiRequest('/api/chemist/reports', { headers: authHeaders() });
}

export function getChemistNotifications() {
  return apiRequest('/api/chemist/notifications', { headers: authHeaders() });
}

export function markChemistNotificationRead(id) {
  return apiRequest(`/api/chemist/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeaders(),
  });
}
