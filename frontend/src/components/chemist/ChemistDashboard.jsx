import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../layout/PageHeader';
import Toast from '../ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  cancelChemistOrder,
  createChemistInventoryItem,
  createChemistOrder,
  deleteChemistInventoryItem,
  getChemistCatalogue,
  getChemistEarnings,
  getChemistInventory,
  getChemistNotifications,
  getChemistOrders,
  getChemistProfile,
  getChemistReports,
  markChemistNotificationRead,
  reviewChemistPrescription,
  updateChemistInventoryItem,
  updateChemistOrderStatus,
  updateChemistProfile,
} from '../../utils/chemistApi';
import { chemistDummyInventory, chemistDummyOrders } from '../../utils/chemistDummyData';
import { BASE_URL } from '../../utils/constants';

const tabs = [
  ['inventory', 'Inventory'],
  ['catalogue', 'Catalogue'],
  ['orders', 'Orders'],
  ['prescriptions', 'Prescription'],
  ['earnings', 'Earnings'],
  ['reports', 'Reports'],
  ['notifications', 'Notifications'],
  ['profile', 'Profile'],
];
const orderTabs = [
  ['new', 'New Orders'],
  ['active', 'Active Orders'],
  ['completed', 'Completed Orders'],
  ['cancelled', 'Cancelled Orders'],
];

const medicineTemplate = {
  name: '',
  category: '',
  composition: '',
  dosage: '',
  batchNumber: '',
  supplierName: '',
  purchasePrice: '',
  sellingPrice: '',
  stockQuantity: '',
  lowStockThreshold: '10',
  expiryDate: '',
  description: '',
  usageInstructions: '',
  image: '',
  isPublicVisible: true,
  availabilityStatus: 'available',
  isPrescriptionRequired: false,
};

function ChemistDashboard() {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('section') || 'inventory';
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [earnings, setEarnings] = useState({ totals: { daily: 0, weekly: 0, monthly: 0 }, history: [], pendingPayments: [] });
  const [reports, setReports] = useState({ bestSelling: [], weeklyRevenue: 0, monthlyRevenue: 0, stockConsumption: [] });
  const [form, setForm] = useState(medicineTemplate);
  const [editingId, setEditingId] = useState('');
  const [orderTab, setOrderTab] = useState('new');
  const [earningsView, setEarningsView] = useState('daily');
  const [profile, setProfile] = useState({ shopName: '', ownerName: '', address: '', city: '', phone: '', email: '', licenseNumber: '', licenseValidityDate: '', deliveryAvailable: true, deliveryRadiusKm: 5, deliveryPincodes: '', profilePhoto: '', operatingHours: { open: '', close: '', days: [] } });

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadInventory = async () => {
    try {
      const [i, c] = await Promise.all([getChemistInventory(), getChemistCatalogue()]);
      setInventory((i.medicines && i.medicines.length) ? i.medicines : chemistDummyInventory);
      setCatalogue((c.medicines && c.medicines.length) ? c.medicines : chemistDummyInventory);
    } catch {
      setInventory(chemistDummyInventory);
      setCatalogue(chemistDummyInventory);
    }
  };

  const loadOrders = async (next = orderTab) => {
    try {
      const data = await getChemistOrders(next);
      setOrders((data.orders && data.orders.length) ? data.orders : chemistDummyOrders);
    } catch {
      setOrders(chemistDummyOrders);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [n, e, r, p] = await Promise.all([getChemistNotifications(), getChemistEarnings('daily'), getChemistReports(), getChemistProfile()]);
        setNotifications(n.notifications || []);
        setEarnings({ totals: e.totals || { daily: 0, weekly: 0, monthly: 0 }, history: e.history || [], pendingPayments: e.pendingPayments || [] });
        setReports(r.reports || { bestSelling: [], weeklyRevenue: 0, monthlyRevenue: 0, stockConsumption: [] });
        const profileData = p.profile || {};
        setProfile((current) => ({ ...current, ...profileData, licenseValidityDate: profileData.licenseValidityDate ? String(profileData.licenseValidityDate).slice(0, 10) : '', deliveryPincodes: (profileData.deliveryPincodes || []).join(', '), operatingHours: { open: profileData.operatingHours?.open || '', close: profileData.operatingHours?.close || '', days: profileData.operatingHours?.days || [] } }));
        await Promise.all([loadInventory(), loadOrders('new')]);
      } catch (error) {
        setInventory(chemistDummyInventory);
        setCatalogue(chemistDummyInventory);
        setOrders(chemistDummyOrders);
        setEarnings({
          totals: { daily: 720, weekly: 4120, monthly: 15840 },
          history: chemistDummyOrders
            .filter((item) => String(item.paymentStatus).toLowerCase() === 'paid')
            .map((item) => ({
              id: item._id,
              patientName: item.patientName,
              orderId: item.orderId,
              medicines: item.items.map((m) => m.medicineName).join(', '),
              amount: item.totalAmount,
              paymentMode: 'Online',
              date: item.orderDate,
            })),
          pendingPayments: chemistDummyOrders
            .filter((item) => String(item.paymentStatus).toLowerCase() !== 'paid')
            .map((item) => ({
              id: item._id,
              orderId: item.orderId,
              patientName: item.patientName,
              amount: item.totalAmount,
              paymentStatus: item.paymentStatus,
            })),
        });
        showToast('error', 'Chemist dashboard fallback mode', `${error.message}. Showing offline sample data.`);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadOrders(orderTab).catch((error) => showToast('error', 'Order load failed', error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTab]);

  useEffect(() => {
    getChemistEarnings(earningsView)
      .then((data) => setEarnings({ totals: data.totals || { daily: 0, weekly: 0, monthly: 0 }, history: data.history || [], pendingPayments: data.pendingPayments || [] }))
      .catch((error) => showToast('error', 'Earnings load failed', error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earningsView]);

  const categoryList = useMemo(() => Array.from(new Set(inventory.map((item) => item.category).filter(Boolean))), [inventory]);
  const rxOrders = useMemo(() => orders.filter((item) => item.items?.some((m) => m.prescriptionRequired) && ['pending', 'rejected'].includes(String(item.prescriptionStatus || '').toLowerCase())), [orders]);

  if (loading) {
    return <div className="aid-card">Loading chemist dashboard...</div>;
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader title={`Welcome, ${user?.shopName || 'Chemist'}`} description="Chemist-only dashboard connected to inventory, orders, catalogue, analytics and profile." breadcrumb="Dashboard / Chemist" illustration={<svg viewBox="0 0 260 180" className="w-64 text-blue-600"><rect x="40" y="34" width="180" height="118" rx="24" fill="#DBEAFE" /><path d="M130 62V124" stroke="#F87171" strokeWidth="10" strokeLinecap="round" /><path d="M98 92H162" stroke="#F87171" strokeWidth="10" strokeLinecap="round" /></svg>} />
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map(([value, label]) => <button key={value} type="button" onClick={() => setSearchParams({ section: value })} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700'}`}>{label}</button>)}</div>
      {tab === 'inventory' ? <InventorySection form={form} setForm={setForm} editingId={editingId} setEditingId={setEditingId} inventory={inventory} setInventory={setInventory} setCatalogue={setCatalogue} categoryList={categoryList} loadInventory={loadInventory} showToast={showToast} /> : null}
      {tab === 'catalogue' ? <CatalogueSection catalogue={catalogue} showToast={showToast} refresh={loadInventory} /> : null}
      {tab === 'orders' ? <OrdersSection orders={orders} orderTab={orderTab} setOrderTab={setOrderTab} refresh={loadOrders} refreshNotifications={async () => setNotifications((await getChemistNotifications()).notifications || [])} refreshEarnings={async () => { const data = await getChemistEarnings(earningsView); setEarnings({ totals: data.totals || { daily: 0, weekly: 0, monthly: 0 }, history: data.history || [], pendingPayments: data.pendingPayments || [] }); }} showToast={showToast} createDemoOrder={createDemoOrder} /> : null}
      {tab === 'prescriptions' ? <PrescriptionSection rxOrders={rxOrders} refresh={loadOrders} showToast={showToast} /> : null}
      {tab === 'earnings' ? <EarningsSection earnings={earnings} earningsView={earningsView} setEarningsView={setEarningsView} /> : null}
      {tab === 'reports' ? <ReportsSection reports={reports} showToast={showToast} /> : null}
      {tab === 'notifications' ? <NotificationSection notifications={notifications} markRead={markRead} /> : null}
      {tab === 'profile' ? <ProfileSection profile={profile} setProfile={setProfile} onSave={saveProfile} /> : null}
    </>
  );

  async function createDemoOrder() {
    try {
      if (!catalogue.length) {
        showToast('error', 'No medicine available', 'Add medicines first.');
        return;
      }
      const m = catalogue[0];
      await createChemistOrder({
        patientName: 'Demo Patient',
        items: [{ medicineId: m._id, medicineName: m.name, quantity: 2, unitPrice: Number(m.sellingPrice || 0), prescriptionRequired: Boolean(m.isPrescriptionRequired) }],
        totalAmount: Number(m.sellingPrice || 0) * 2,
        paymentStatus: 'Pending',
        paymentMode: 'Online',
        fulfillmentType: 'delivery',
        deliveryAddress: 'Demo Address',
        prescriptionStatus: m.isPrescriptionRequired ? 'pending' : 'not_required',
      });
      await loadOrders(orderTab);
      showToast('success', 'Demo order created', 'You can test order workflow now.');
    } catch (error) {
      showToast('error', 'Demo order failed', error.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const payload = { ...profile, deliveryRadiusKm: Number(profile.deliveryRadiusKm || 0), deliveryPincodes: String(profile.deliveryPincodes || '').split(',').map((item) => item.trim()).filter(Boolean) };
      const response = await updateChemistProfile(payload);
      updateProfile(response.profile);
      showToast('success', 'Profile updated', 'Shop details saved.');
    } catch (error) {
      showToast('error', 'Profile save failed', error.message);
    }
  }

  async function markRead(id) {
    try {
      await markChemistNotificationRead(id);
      const updated = await getChemistNotifications();
      setNotifications(updated.notifications || []);
    } catch (error) {
      showToast('error', 'Notification update failed', error.message);
    }
  }
}

function InventorySection({ form, setForm, editingId, setEditingId, inventory, setInventory, setCatalogue, categoryList, loadInventory, showToast }) {
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.category || !form.batchNumber || !form.expiryDate) {
      showToast('error', 'Required fields missing', 'Please fill Medicine Name, Category, Batch Number and Expiry Date.');
      return;
    }

    try {
      const payload = { ...form, purchasePrice: Number(form.purchasePrice || 0), sellingPrice: Number(form.sellingPrice || 0), stockQuantity: Number(form.stockQuantity || 0), lowStockThreshold: Number(form.lowStockThreshold || 0) };
      if (editingId) {
        await updateChemistInventoryItem(editingId, payload);
      } else {
        await createChemistInventoryItem(payload);
      }
      setForm(medicineTemplate);
      setEditingId('');
      await loadInventory();
      showToast('success', editingId ? 'Medicine updated' : 'Medicine added', 'Inventory saved.');
    } catch (error) {
      const localId = editingId || `local-${Date.now()}`;
      const localRecord = {
        ...form,
        _id: localId,
        stockQuantity: Number(form.stockQuantity || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        isLowStock: Number(form.stockQuantity || 0) <= Number(form.lowStockThreshold || 0),
        isExpiringSoon: form.expiryDate ? (new Date(form.expiryDate).getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000) : false,
      };

      if (editingId) {
        setInventory((current) => current.map((item) => (item._id === editingId ? localRecord : item)));
      } else {
        setInventory((current) => [localRecord, ...current]);
      }

      setCatalogue((current) => {
        const exists = current.some((item) => item._id === localId);
        if (exists) return current.map((item) => (item._id === localId ? localRecord : item));
        return [localRecord, ...current];
      });

      setForm(medicineTemplate);
      setEditingId('');
      showToast('error', 'Inventory saved locally', `${error.message}. API unavailable, local fallback used.`);
    }
  };
  const remove = async (id) => {
    try {
      await deleteChemistInventoryItem(id);
      await loadInventory();
    } catch (error) {
      setInventory((current) => current.filter((item) => item._id !== id));
      setCatalogue((current) => current.filter((item) => item._id !== id));
      showToast('error', 'Deleted locally', `${error.message}. API unavailable, removed from local fallback.`);
    }
  };
  return <div className="aid-card"><p className="font-semibold">Inventory records: {inventory.length} medicines</p><p className="mt-1 text-sm text-gray-500">Fields include name, category, composition, dosage, batch, supplier, prices, stock, expiry and low-stock threshold.</p><form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-3">{[['name', 'Medicine'], ['category', 'Category'], ['batchNumber', 'Batch'], ['composition', 'Composition'], ['dosage', 'Dosage'], ['supplierName', 'Supplier'], ['purchasePrice', 'Purchase Price'], ['sellingPrice', 'Selling Price'], ['stockQuantity', 'Stock'], ['lowStockThreshold', 'Threshold'], ['expiryDate', 'Expiry Date']].map(([field, label]) => <input key={field} type={field.includes('Price') || field.includes('stock') || field.includes('Threshold') ? 'number' : field === 'expiryDate' ? 'date' : 'text'} className="aid-input" placeholder={label} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} />)}<textarea className="aid-input md:col-span-3" placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /><textarea className="aid-input md:col-span-3" placeholder="Usage instructions" value={form.usageInstructions} onChange={(event) => setForm((current) => ({ ...current, usageInstructions: event.target.value }))} /><div className="md:col-span-3 flex gap-2"><button type="submit" className="aid-btn-primary">{editingId ? 'Update' : 'Add'} Medicine</button>{editingId ? <button type="button" className="rounded-lg border border-gray-300 px-4 py-3 font-semibold dark:border-gray-700" onClick={() => { setEditingId(''); setForm(medicineTemplate); }}>Cancel Edit</button> : null}</div></form><div className="mt-4 space-y-2">{inventory.map((item) => <div key={item._id} className={`rounded-xl border p-3 ${item.isExpiringSoon ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20' : 'border-gray-200 dark:border-gray-700'}`}><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{item.name} ({item.category})</p><p className="text-sm text-gray-500">Stock {item.stockQuantity} / Threshold {item.lowStockThreshold} • Batch {item.batchNumber} • Expiry {new Date(item.expiryDate).toLocaleDateString('en-IN')}</p>{item.isLowStock ? <p className="text-xs font-semibold text-red-600">Low stock alert</p> : null}{item.isExpiringSoon ? <p className="text-xs font-semibold text-amber-600">Expiring within 30 days</p> : null}</div><div className="flex gap-2"><button type="button" className="rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => { setEditingId(item._id); setForm({ ...medicineTemplate, ...item, expiryDate: String(item.expiryDate).slice(0, 10) }); }}>Edit</button><button type="button" className="rounded-lg bg-red-500 px-3 py-2 text-white" onClick={() => remove(item._id)}>Delete</button></div></div></div>)}</div><div className="mt-3 text-sm text-gray-500">Categories: {categoryList.join(', ') || 'No categories yet'}</div></div>;
}

function CatalogueSection({ catalogue, refresh, showToast }) {
  const toggle = async (item, payload) => { try { await updateChemistInventoryItem(item._id, payload); await refresh(); } catch (error) { showToast('error', 'Catalogue update failed', error.message); } };
  return <div className="aid-card grid gap-3 md:grid-cols-2">{catalogue.map((item) => <div key={item._id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"><p className="font-semibold">{item.name}</p><p className="text-sm text-gray-500">{item.category} • Rs. {item.sellingPrice} • Stock {item.stockQuantity}</p><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.description || 'No description'}</p><div className="mt-3 flex gap-2"><button type="button" className={`rounded-lg px-3 py-2 text-sm font-semibold ${item.isPublicVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`} onClick={() => toggle(item, { isPublicVisible: !item.isPublicVisible })}>{item.isPublicVisible ? 'Visible to Patients' : 'Hidden from Patients'}</button><button type="button" className={`rounded-lg px-3 py-2 text-sm font-semibold ${item.availabilityStatus === 'available' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`} onClick={() => toggle(item, { availabilityStatus: item.availabilityStatus === 'available' ? 'out_of_stock' : 'available' })}>{item.availabilityStatus === 'available' ? 'Mark Out of Stock' : 'Mark Available'}</button></div></div>)}</div>;
}

function OrdersSection({ orders, orderTab, setOrderTab, refresh, refreshNotifications, refreshEarnings, showToast, createDemoOrder }) {
  const updateStatus = async (id, status) => { try { await updateChemistOrderStatus(id, status); await Promise.all([refresh(orderTab), refreshNotifications(), refreshEarnings()]); } catch (error) { showToast('error', 'Order update failed', error.message); } };
  const cancel = async (id) => { const reason = window.prompt('Enter cancellation reason'); if (!reason) return; try { await cancelChemistOrder(id, reason); await Promise.all([refresh(orderTab), refreshNotifications()]); } catch (error) { showToast('error', 'Cancel failed', error.message); } };
  return <div className="space-y-3"><div className="aid-card flex flex-wrap items-center justify-between gap-3"><div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">{orderTabs.map(([value, label]) => <button key={value} type="button" onClick={() => setOrderTab(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${orderTab === value ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>{label}</button>)}</div><button type="button" className="aid-btn-primary" onClick={createDemoOrder}>Create Demo Order</button></div>{orders.map((item) => <div key={item._id} className="aid-card"><p className="font-semibold">{item.orderId} • {item.patientName}</p><p className="text-sm text-gray-500">{item.items?.map((m) => `${m.medicineName} x${m.quantity}`).join(', ')}</p><p className="text-sm text-gray-500">Total Rs. {item.totalAmount} • {item.paymentStatus} • {item.fulfillmentType}</p><div className="mt-2 flex gap-2"><select className="aid-input w-auto" value={item.status} onChange={(event) => updateStatus(item._id, event.target.value)}>{['Pending', 'Processing', 'Dispatched', 'Delivered'].map((status) => <option key={status}>{status}</option>)}</select><button type="button" className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white" onClick={() => cancel(item._id)}>Cancel</button></div></div>)}{!orders.length ? <div className="aid-card text-sm text-gray-500">No orders for this tab.</div> : null}</div>;
}

function PrescriptionSection({ rxOrders, refresh, showToast }) {
  const review = async (id, action) => { const reason = action === 'reject' ? window.prompt('Enter rejection reason') || '' : ''; try { await reviewChemistPrescription(id, action, reason); await refresh('new'); } catch (error) { showToast('error', 'Prescription review failed', error.message); } };
  return <div className="space-y-3">{rxOrders.map((item) => <div key={item._id} className="aid-card"><p className="font-semibold">{item.orderId} • {item.patientName}</p><p className="text-sm text-gray-500">Prescription status: {item.prescriptionStatus}</p>{item.prescriptionFileUrl ? <a href={item.prescriptionFileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600">View Prescription</a> : <p className="text-sm text-amber-600">Prescription file missing.</p>}<div className="mt-2 flex gap-2"><button type="button" className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white" onClick={() => review(item._id, 'approve')}>Approve</button><button type="button" className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white" onClick={() => review(item._id, 'reject')}>Reject</button></div></div>)}{!rxOrders.length ? <div className="aid-card text-sm text-gray-500">No prescription orders pending.</div> : null}</div>;
}

function EarningsSection({ earnings, earningsView, setEarningsView }) {
  return <div className="space-y-3"><div className="aid-card"><div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">{['daily', 'weekly', 'monthly'].map((item) => <button key={item} type="button" onClick={() => setEarningsView(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${earningsView === item ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>{item}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">Daily: Rs. {earnings.totals?.daily || 0}</div><div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">Weekly: Rs. {earnings.totals?.weekly || 0}</div><div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">Monthly: Rs. {earnings.totals?.monthly || 0}</div></div></div><div className="aid-card overflow-x-auto"><table className="min-w-full"><thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="pb-3 text-left">Patient</th><th className="pb-3 text-left">Order ID</th><th className="pb-3 text-left">Medicines</th><th className="pb-3 text-left">Amount</th><th className="pb-3 text-left">Mode</th><th className="pb-3 text-left">Date</th></tr></thead><tbody>{earnings.history?.map((item) => <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800"><td className="py-3">{item.patientName}</td><td className="py-3">{item.orderId}</td><td className="py-3">{item.medicines}</td><td className="py-3">Rs. {item.amount}</td><td className="py-3">{item.paymentMode}</td><td className="py-3">{new Date(item.date).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table></div><div className="aid-card"><h3 className="font-semibold">Pending Payments</h3><div className="mt-2 space-y-2">{earnings.pendingPayments?.map((item) => <div key={item.id} className="rounded-xl bg-amber-50 p-2 text-sm dark:bg-amber-950/20">{item.orderId} • {item.patientName} • Rs. {item.amount} • {item.paymentStatus}</div>)}{!earnings.pendingPayments?.length ? <p className="text-sm text-gray-500">No pending payments.</p> : null}</div></div></div>;
}

function ReportsSection({ reports, showToast }) {
  const exportReport = async (format) => { try { const token = localStorage.getItem('aid_token'); const response = await fetch(`${BASE_URL}/api/chemist/reports/export?format=${format}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!response.ok) throw new Error('Export failed'); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `chemist-report.${format === 'pdf' ? 'pdf' : 'csv'}`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); } catch (error) { showToast('error', 'Export failed', error.message); } };
  return <div className="space-y-3"><div className="aid-card flex gap-3"><button type="button" className="aid-btn-primary" onClick={() => exportReport('excel')}>Export Excel</button><button type="button" className="aid-btn-accent" onClick={() => exportReport('pdf')}>Export PDF</button></div><div className="aid-card"><p className="font-semibold">Weekly Revenue: Rs. {reports.weeklyRevenue || 0}</p><p className="font-semibold">Monthly Revenue: Rs. {reports.monthlyRevenue || 0}</p></div><div className="aid-card"><h3 className="font-semibold">Best Selling Medicines</h3><div className="mt-2 space-y-1">{reports.bestSelling?.map((item) => <div key={item.name} className="rounded-xl bg-gray-50 p-2 text-sm dark:bg-gray-900">{item.name} — {item.quantitySold} sold</div>)}</div></div><div className="aid-card"><h3 className="font-semibold">Stock Consumption Trend</h3><div className="mt-2 space-y-1">{reports.stockConsumption?.map((item) => <div key={item.medicine} className="rounded-xl bg-gray-50 p-2 text-sm dark:bg-gray-900">{item.medicine} — In stock {item.inStock}, Sold {item.estimatedSold}</div>)}</div></div></div>;
}

function NotificationSection({ notifications, markRead }) {
  return <div className="aid-card space-y-2">{notifications.map((item) => <div key={item._id} className={`rounded-xl border p-3 ${item.read ? 'border-gray-200 dark:border-gray-700' : 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'}`}><p className="font-semibold">{item.title}</p><p className="text-sm text-gray-600 dark:text-gray-300">{item.message}</p><p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('en-IN')}</p>{!item.read ? <button type="button" className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => markRead(item._id)}>Mark as Read</button> : null}</div>)}{!notifications.length ? <p className="text-sm text-gray-500">No chemist notifications.</p> : null}</div>;
}

function ProfileSection({ profile, setProfile, onSave }) {
  return <form onSubmit={onSave} className="aid-card grid gap-3 md:grid-cols-2">{[['shopName', 'Shop Name', 'text'], ['ownerName', 'Owner Name', 'text'], ['address', 'Address', 'text'], ['city', 'City', 'text'], ['phone', 'Contact Number', 'text'], ['email', 'Email', 'email'], ['licenseNumber', 'Drug License Number', 'text'], ['licenseValidityDate', 'License Validity Date', 'date'], ['profilePhoto', 'Profile/Logo URL', 'text'], ['deliveryRadiusKm', 'Delivery Radius (km)', 'number'], ['deliveryPincodes', 'Delivery Pin Codes', 'text']].map(([field, label, type]) => <input key={field} type={type} className="aid-input" placeholder={label} value={profile[field] || ''} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} />)}<input type="time" className="aid-input" value={profile.operatingHours?.open || ''} onChange={(event) => setProfile((current) => ({ ...current, operatingHours: { ...current.operatingHours, open: event.target.value } }))} /><input type="time" className="aid-input" value={profile.operatingHours?.close || ''} onChange={(event) => setProfile((current) => ({ ...current, operatingHours: { ...current.operatingHours, close: event.target.value } }))} /><div className="md:col-span-2 flex items-center gap-2"><input type="checkbox" className="h-6 w-6" checked={Boolean(profile.deliveryAvailable)} onChange={(event) => setProfile((current) => ({ ...current, deliveryAvailable: event.target.checked }))} /><span className="font-semibold">Delivery Available</span></div><div className="md:col-span-2"><button type="submit" className="aid-btn-primary">Save Profile</button></div></form>;
}

export default ChemistDashboard;
