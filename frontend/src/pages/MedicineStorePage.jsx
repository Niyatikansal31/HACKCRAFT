import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import Toast from '../components/ui/Toast';
import VoiceInputButton from '../components/ui/VoiceInputButton';
import {
  addMedicineToCart,
  clearMedicineCart,
  getMedicineCart,
  medicineCatalog,
  removeMedicineFromCart,
  saveMedicineOrder,
  updateMedicineCartQuantity,
} from '../utils/medicineStore';
import { savePayment } from '../utils/appointments';
import { saveSnapshot } from '../utils/offlineStore';

function MedicineStorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState(getMedicineCart());
  const [checkoutMode, setCheckoutMode] = useState('delivery');
  const [address, setAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [toast, setToast] = useState(null);

  const categories = useMemo(() => ['All', ...new Set(medicineCatalog.map((item) => item.category))], []);

  useEffect(() => {
    saveSnapshot('medicine_catalogue', medicineCatalog);
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicineCatalog.filter((medicine) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        medicine.name.toLowerCase().includes(query) ||
        medicine.description.toLowerCase().includes(query);
      const matchesCategory = category === 'All' || medicine.category === category;
      const matchesMin = minPrice === '' || medicine.price >= Number(minPrice);
      const matchesMax = maxPrice === '' || medicine.price <= Number(maxPrice);
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });
  }, [category, maxPrice, minPrice, search]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const addToCart = (medicine, quantity = 1) => {
    setCart(addMedicineToCart(medicine, quantity));
    showToast('success', 'Added to cart', `${medicine.name} added to cart.`);
  };

  const buyNow = (medicine) => {
    setCart(addMedicineToCart(medicine, 1));
    showToast('success', 'Ready to checkout', `${medicine.name} is ready in your cart. Complete checkout below.`);
  };

  const placeOrder = () => {
    if (!cart.length) {
      showToast('error', 'Cart is empty', 'Add at least one medicine before checkout.');
      return;
    }

    if (checkoutMode === 'delivery' && !address.trim()) {
      showToast('error', 'Address needed', 'Please enter delivery address.');
      return;
    }

    const orderId = `MED-${Date.now()}`;
    const orderDate = new Date().toLocaleDateString('en-IN');
    const order = {
      id: orderId,
      date: orderDate,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      taxes,
      total,
      mode: checkoutMode,
      address: checkoutMode === 'delivery' ? address : 'Pickup from store',
      paymentStatus,
      paymentType: 'medicine',
    };

    saveMedicineOrder(order);
    savePayment({
      date: orderDate,
      status: paymentStatus,
      paymentType: 'medicine',
      orderId,
      description: `Medicine purchase (${order.items.length} item${order.items.length > 1 ? 's' : ''})`,
      medicines: order.items.map((item) => item.name).join(', '),
      quantity: order.quantity,
      amount: total,
    });

    clearMedicineCart();
    setCart([]);
    setAddress('');
    setPaymentStatus('Paid');
    showToast('success', 'Order placed', `Order ${orderId} confirmed successfully.`);
  };

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title="Medicine Store"
        description="Browse medicines, add to cart, and complete checkout with delivery or pickup."
        breadcrumb="Dashboard / Buy Medicines"
        illustration={<svg viewBox="0 0 240 180" className="w-60 text-blue-600"><rect x="34" y="30" width="172" height="120" rx="24" fill="#DBEAFE" /><rect x="62" y="50" width="48" height="80" rx="12" fill="white" /><rect x="130" y="50" width="48" height="80" rx="12" fill="white" /><path d="M86 70V108" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /><path d="M67 89H105" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /><path d="M145 85H163" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" /></svg>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="aid-card">
            <h3 className="text-xl font-bold">Search and Filters</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="relative">
                <input
                  className="aid-input pr-14"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search medicine by name"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={setSearch} />
                </div>
              </div>
              <div className="relative">
                <select className="aid-input pr-14" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton options={categories.map((item) => ({ label: item, value: item }))} onResult={setCategory} />
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="aid-input pr-14"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Min price"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={(result) => setMinPrice(String(result).replace(/[^\d]/g, ''))} />
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="aid-input pr-14"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Max price"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={(result) => setMaxPrice(String(result).replace(/[^\d]/g, ''))} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredMedicines.map((medicine) => (
              <div key={medicine.id} className="aid-card">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/30">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none"><rect x="4" y="9" width="16" height="6" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M10 9L14 15" stroke="#F87171" strokeWidth="2" strokeLinecap="round" /></svg>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">{medicine.category}</span>
                </div>
                <h4 className="text-lg font-bold">{medicine.name}</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{medicine.description}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-semibold">Price:</span> Rs. {medicine.price}</p>
                  <p><span className="font-semibold">Stock:</span> {medicine.stock}</p>
                  <p><span className="font-semibold">Usage:</span> {medicine.dosage}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" className="aid-btn-primary w-full" onClick={() => addToCart(medicine)}>
                    Add to Cart
                  </button>
                  <button type="button" className="aid-btn-accent w-full" onClick={() => buyNow(medicine)}>
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="aid-card">
            <h3 className="text-xl font-bold">Cart Summary</h3>
            <div className="mt-4 space-y-3">
              {cart.length ? (
                cart.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 p-3 dark:border-gray-700">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">Rs. {item.price} x {item.quantity}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" className="rounded-lg border border-gray-300 px-3 py-1" onClick={() => setCart(updateMedicineCartQuantity(item.id, item.quantity - 1))}>-</button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button type="button" className="rounded-lg border border-gray-300 px-3 py-1" onClick={() => setCart(updateMedicineCartQuantity(item.id, item.quantity + 1))}>+</button>
                      <button type="button" className="ml-auto text-sm font-semibold text-red-500" onClick={() => setCart(removeMedicineFromCart(item.id))}>Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Cart is empty. Add medicines to continue.</p>
              )}
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-900">
              <p className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal}</span></p>
              <p className="mt-2 flex justify-between"><span>Taxes (5%)</span><span>Rs. {taxes}</span></p>
              <p className="mt-2 flex justify-between font-bold"><span>Total</span><span>Rs. {total}</span></p>
            </div>
          </div>

          <div className="aid-card">
            <h3 className="text-xl font-bold">Checkout</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block font-semibold">Delivery Mode</label>
                <div className="flex gap-3">
                  <button type="button" className={`rounded-xl px-4 py-2 font-semibold ${checkoutMode === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`} onClick={() => setCheckoutMode('delivery')}>Delivery</button>
                  <button type="button" className={`rounded-xl px-4 py-2 font-semibold ${checkoutMode === 'pickup' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`} onClick={() => setCheckoutMode('pickup')}>Pickup</button>
                </div>
              </div>

              {checkoutMode === 'delivery' ? (
                <div className="relative">
                  <label className="mb-2 block font-semibold">Delivery Address</label>
                  <textarea
                    className="aid-input pr-14"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter your full delivery address"
                  />
                  <div className="absolute right-2 top-12">
                    <VoiceInputButton onResult={setAddress} />
                  </div>
                </div>
              ) : null}

              <div className="relative">
                <label className="mb-2 block font-semibold">Payment Status (Demo)</label>
                <select className="aid-input pr-14" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <div className="absolute right-2 top-10">
                  <VoiceInputButton
                    options={[
                      { label: 'Paid', value: 'Paid' },
                      { label: 'Pending', value: 'Pending' },
                      { label: 'Failed', value: 'Failed' },
                    ]}
                    onResult={setPaymentStatus}
                  />
                </div>
              </div>

              <button type="button" className="aid-btn-accent w-full" onClick={placeOrder}>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default MedicineStorePage;
