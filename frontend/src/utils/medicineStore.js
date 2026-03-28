import { saveSnapshot } from './offlineStore';

const CART_KEY = 'aid_medicine_cart';
const ORDERS_KEY = 'aid_medicine_orders';

export const medicineCatalog = [
  {
    id: 'med-001',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotic',
    description: 'Used to treat bacterial infections.',
    price: 180,
    stock: 64,
    dosage: '1 capsule after food, twice daily for 5 days.',
  },
  {
    id: 'med-002',
    name: 'Paracetamol 650mg',
    category: 'Painkiller',
    description: 'Relief from fever and mild pain.',
    price: 60,
    stock: 220,
    dosage: '1 tablet every 6-8 hours as needed.',
  },
  {
    id: 'med-003',
    name: 'Cetirizine 10mg',
    category: 'Allergy',
    description: 'Helps with sneezing and allergic symptoms.',
    price: 45,
    stock: 140,
    dosage: '1 tablet once at night.',
  },
  {
    id: 'med-004',
    name: 'Pantoprazole 40mg',
    category: 'Gastro',
    description: 'For acidity and reflux management.',
    price: 120,
    stock: 85,
    dosage: '1 tablet before breakfast.',
  },
  {
    id: 'med-005',
    name: 'ORS Rehydration Salts',
    category: 'Hydration',
    description: 'Supports hydration after dehydration.',
    price: 30,
    stock: 300,
    dosage: 'Mix one sachet in 1L clean water and sip slowly.',
  },
  {
    id: 'med-006',
    name: 'Ibuprofen 400mg',
    category: 'Painkiller',
    description: 'For pain and inflammation relief.',
    price: 75,
    stock: 102,
    dosage: '1 tablet after meals, maximum 3/day.',
  },
];

function readStorage(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function getMedicineCart() {
  return readStorage(CART_KEY, []);
}

export function saveMedicineCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addMedicineToCart(medicine, quantity = 1) {
  const current = getMedicineCart();
  const existing = current.find((item) => item.id === medicine.id);

  let next;
  if (existing) {
    next = current.map((item) =>
      item.id === medicine.id
        ? { ...item, quantity: Math.max(1, Math.min(item.quantity + quantity, medicine.stock)) }
        : item,
    );
  } else {
    next = [...current, { ...medicine, quantity: Math.max(1, Math.min(quantity, medicine.stock)) }];
  }

  saveMedicineCart(next);
  return next;
}

export function updateMedicineCartQuantity(medicineId, quantity) {
  const current = getMedicineCart();
  const next = current
    .map((item) =>
      item.id === medicineId
        ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, item.stock)) }
        : item,
    )
    .filter((item) => item.quantity > 0);

  saveMedicineCart(next);
  return next;
}

export function removeMedicineFromCart(medicineId) {
  const next = getMedicineCart().filter((item) => item.id !== medicineId);
  saveMedicineCart(next);
  return next;
}

export function clearMedicineCart() {
  saveMedicineCart([]);
}

export function getMedicineOrders() {
  return readStorage(ORDERS_KEY, []);
}

export function saveMedicineOrder(order) {
  const current = getMedicineOrders();
  const next = [order, ...current];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  saveSnapshot('medicine_catalogue', medicineCatalog);
  return order;
}
