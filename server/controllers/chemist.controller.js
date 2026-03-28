import Chemist from '../models/Chemist.model.js';
import ChemistMedicine from '../models/ChemistMedicine.model.js';
import ChemistOrder from '../models/ChemistOrder.model.js';
import ChemistNotification from '../models/ChemistNotification.model.js';
import { sendSms } from '../services/sms.service.js';

const dayMs = 24 * 60 * 60 * 1000;

function buildOrderId() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}

async function pushNotification(chemistId, type, title, message, meta = {}, alertKey = '') {
  if (alertKey) {
    const existing = await ChemistNotification.findOne({ chemistId, alertKey, read: false });
    if (existing) return existing;
  }

  return ChemistNotification.create({
    chemistId,
    type,
    title,
    message,
    meta,
    alertKey,
  });
}

async function syncInventoryAlerts(chemistId) {
  const now = new Date();
  const expiryWindow = new Date(now.getTime() + 30 * dayMs);
  const medicines = await ChemistMedicine.find({ chemistId });

  await Promise.all(
    medicines.map(async (medicine) => {
      if (medicine.stockQuantity <= medicine.lowStockThreshold) {
        await pushNotification(
          chemistId,
          'low_stock',
          'Low stock alert',
          `${medicine.name} is below threshold (${medicine.stockQuantity} left).`,
          { medicineId: medicine._id },
          `low-stock-${medicine._id}`,
        );
      }

      if (medicine.expiryDate <= expiryWindow && medicine.expiryDate >= now) {
        await pushNotification(
          chemistId,
          'expiry',
          'Expiry alert',
          `${medicine.name} is expiring within 30 days.`,
          { medicineId: medicine._id },
          `expiry-${medicine._id}`,
        );
      }
    }),
  );
}

async function ensureSeedData(chemistId) {
  const medicineCount = await ChemistMedicine.countDocuments({ chemistId });
  if (medicineCount === 0) {
    const now = Date.now();
    const seedMedicines = [
      ['Paracetamol 650', 'Painkiller', 'Paracetamol', 'PCM-650-A1', 22, 35, 140, 20, 180, false],
      ['Dolo 650', 'Painkiller', 'Paracetamol', 'DLO-650-B2', 24, 38, 86, 25, 160, false],
      ['Crocin Advance', 'Painkiller', 'Paracetamol', 'CRC-ADV-C3', 25, 42, 0, 18, 140, false],
      ['Azithromycin 500', 'Antibiotic', 'Azithromycin', 'AZI-500-D4', 70, 115, 14, 20, 120, true],
      ['Amoxicillin 500', 'Antibiotic', 'Amoxicillin', 'AMX-500-E5', 78, 120, 35, 20, 20, true],
      ['Cetirizine 10', 'Allergy', 'Cetirizine', 'CTZ-010-F6', 12, 25, 170, 30, 240, false],
      ['Levocetirizine 5', 'Allergy', 'Levocetirizine', 'LVC-005-G7', 14, 30, 28, 25, 150, false],
      ['Pantoprazole 40', 'Gastro', 'Pantoprazole', 'PAN-040-H8', 34, 60, 75, 20, 190, false],
      ['Ranitidine 150', 'Gastro', 'Ranitidine', 'RAN-150-I9', 18, 34, 9, 15, 25, false],
      ['ORS Sachet', 'Hydration', 'ORS Salts', 'ORS-012-J0', 8, 15, 16, 20, 320, false],
      ['Zinc 20 mg', 'Supplements', 'Zinc Sulphate', 'ZNC-020-K1', 10, 22, 95, 25, 210, false],
      ['Vitamin D3 60000', 'Supplements', 'Cholecalciferol', 'VD3-600-L2', 24, 48, 46, 15, 170, false],
      ['Metformin 500', 'Diabetes', 'Metformin', 'MTF-500-M3', 28, 54, 62, 20, 250, true],
      ['Glimipride 1', 'Diabetes', 'Glimipride', 'GLM-001-N4', 22, 44, 12, 18, 80, true],
      ['Amlodipine 5', 'Cardiac', 'Amlodipine', 'AML-005-O5', 18, 36, 130, 25, 260, true],
      ['Telmisartan 40', 'Cardiac', 'Telmisartan', 'TEL-040-P6', 34, 62, 7, 12, 70, true],
      ['Ibuprofen 400', 'Painkiller', 'Ibuprofen', 'IBU-400-Q7', 20, 38, 58, 18, 180, false],
      ['Diclofenac Gel', 'Painkiller', 'Diclofenac', 'DCL-GEL-R8', 46, 82, 19, 10, 90, false],
      ['Saline Nasal Spray', 'Respiratory', 'Sodium Chloride', 'SNS-001-S9', 44, 79, 0, 8, 130, false],
      ['Cough Syrup DXM', 'Respiratory', 'Dextromethorphan', 'CSY-DXM-T0', 52, 85, 21, 10, 145, false],
    ];

    const meds = await ChemistMedicine.insertMany(
      seedMedicines.map(([name, category, composition, batchNumber, purchasePrice, sellingPrice, stockQuantity, lowStockThreshold, expiryInDays, rx]) => ({
        chemistId,
        name,
        category,
        composition,
        dosage: 'As directed by doctor',
        batchNumber,
        supplierName: 'City Med Distributors',
        purchasePrice,
        sellingPrice,
        stockQuantity,
        lowStockThreshold,
        expiryDate: new Date(now + expiryInDays * dayMs),
        description: `${name} from pharmacy inventory`,
        usageInstructions: 'Follow dosage instructions carefully',
        isPublicVisible: true,
        availabilityStatus: stockQuantity === 0 ? 'out_of_stock' : 'available',
        isPrescriptionRequired: rx,
      })),
    );

    await ChemistOrder.insertMany([
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Ravi Kumar',
        patientPhone: '9876500011',
        items: [{ medicineId: meds[0]._id, medicineName: meds[0].name, quantity: 2, unitPrice: meds[0].sellingPrice, prescriptionRequired: false }],
        totalAmount: meds[0].sellingPrice * 2,
        paymentStatus: 'Paid',
        paymentMode: 'Online',
        fulfillmentType: 'delivery',
        deliveryAddress: 'HSR Layout, Bengaluru',
        status: 'Delivered',
        prescriptionStatus: 'not_required',
        orderDate: new Date(now - 2 * dayMs),
      },
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Asha Verma',
        patientPhone: '9876500012',
        items: [{ medicineId: meds[1]._id, medicineName: meds[1].name, quantity: 1, unitPrice: meds[1].sellingPrice, prescriptionRequired: true }],
        totalAmount: meds[1].sellingPrice,
        paymentStatus: 'Pending',
        paymentMode: 'Cash',
        fulfillmentType: 'pickup',
        status: 'Pending',
        prescriptionStatus: 'pending',
        prescriptionFileUrl: 'https://example.com/demo-prescription.pdf',
        orderDate: new Date(now - 5 * 60 * 60 * 1000),
      },
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Nisha Singh',
        patientPhone: '9876500013',
        items: [{ medicineId: meds[2]._id, medicineName: meds[2].name, quantity: 3, unitPrice: meds[2].sellingPrice, prescriptionRequired: false }],
        totalAmount: meds[2].sellingPrice * 3,
        paymentStatus: 'Pending',
        paymentMode: 'Online',
        fulfillmentType: 'delivery',
        deliveryAddress: 'Koramangala, Bengaluru',
        status: 'Processing',
        prescriptionStatus: 'not_required',
        orderDate: new Date(now - 60 * 60 * 1000),
      },
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Imran Ali',
        patientPhone: '9876500014',
        items: [{ medicineId: meds[0]._id, medicineName: meds[0].name, quantity: 1, unitPrice: meds[0].sellingPrice, prescriptionRequired: false }],
        totalAmount: meds[0].sellingPrice,
        paymentStatus: 'Failed',
        paymentMode: 'Online',
        fulfillmentType: 'delivery',
        deliveryAddress: 'BTM Layout, Bengaluru',
        status: 'Cancelled',
        cancelReason: 'Payment failure',
        prescriptionStatus: 'not_required',
        orderDate: new Date(now - dayMs),
      },
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Sanjay Patel',
        patientPhone: '9876500015',
        items: [{ medicineId: meds[15]._id, medicineName: meds[15].name, quantity: 1, unitPrice: meds[15].sellingPrice, prescriptionRequired: true }],
        totalAmount: meds[15].sellingPrice,
        paymentStatus: 'Pending',
        paymentMode: 'Cash',
        fulfillmentType: 'pickup',
        status: 'Pending',
        prescriptionStatus: 'pending',
        prescriptionFileUrl: 'https://example.com/demo-prescription-2.pdf',
        orderDate: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        chemistId,
        orderId: buildOrderId(),
        patientName: 'Pooja Nair',
        patientPhone: '9876500016',
        items: [{ medicineId: meds[10]._id, medicineName: meds[10].name, quantity: 2, unitPrice: meds[10].sellingPrice, prescriptionRequired: false }],
        totalAmount: meds[10].sellingPrice * 2,
        paymentStatus: 'Paid',
        paymentMode: 'Online',
        fulfillmentType: 'delivery',
        deliveryAddress: 'Indiranagar, Bengaluru',
        status: 'Delivered',
        prescriptionStatus: 'not_required',
        orderDate: new Date(now - 3 * dayMs),
      },
    ]);
  }
}

function roleGuard(req, res) {
  if (req.user?.role !== 'chemist') {
    res.status(403).json({ success: false, message: 'Chemist access only' });
    return false;
  }
  return true;
}

export async function getChemistProfile(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const chemist = await Chemist.findById(req.user.id).select('-passwordHash');
    if (!chemist) return res.status(404).json({ success: false, message: 'Chemist not found' });
    return res.json({ success: true, profile: chemist });
  } catch (error) {
    return next(error);
  }
}

export async function updateChemistProfile(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const allowed = [
      'shopName',
      'ownerName',
      'address',
      'city',
      'phone',
      'email',
      'licenseNumber',
      'licenseValidityDate',
      'profilePhoto',
      'operatingHours',
      'deliveryAvailable',
      'deliveryRadiusKm',
      'deliveryPincodes',
      'servicesOffered',
    ];

    const payload = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)),
    );
    const profile = await Chemist.findByIdAndUpdate(req.user.id, payload, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');
    return res.json({ success: true, profile });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = 'Duplicate value found in profile fields';
    }
    return next(error);
  }
}

export async function getInventory(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    await syncInventoryAlerts(req.user.id);

    const { search = '', category = '', visibility = '' } = req.query;
    const filter = { chemistId: req.user.id };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (visibility === 'public') filter.isPublicVisible = true;
    if (visibility === 'private') filter.isPublicVisible = false;

    const medicines = await ChemistMedicine.find(filter).sort({ expiryDate: 1, name: 1 });
    const now = new Date();
    const expiryWindow = new Date(now.getTime() + 30 * dayMs);

    return res.json({
      success: true,
      medicines: medicines.map((item) => ({
        ...item.toObject(),
        isLowStock: item.stockQuantity <= item.lowStockThreshold,
        isExpiringSoon: item.expiryDate <= expiryWindow && item.expiryDate >= now,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createInventoryItem(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const payload = {
      ...req.body,
      chemistId: req.user.id,
    };
    const medicine = await ChemistMedicine.create(payload);
    return res.status(201).json({ success: true, medicine });
  } catch (error) {
    return next(error);
  }
}

export async function updateInventoryItem(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const medicine = await ChemistMedicine.findOneAndUpdate(
      { _id: req.params.id, chemistId: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    return res.json({ success: true, medicine });
  } catch (error) {
    return next(error);
  }
}

export async function deleteInventoryItem(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const deleted = await ChemistMedicine.findOneAndDelete({ _id: req.params.id, chemistId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Medicine not found' });
    return res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    return next(error);
  }
}

export async function getCatalogue(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    const { search = '', category = '' } = req.query;
    const filter = { chemistId: req.user.id };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;

    const medicines = await ChemistMedicine.find(filter).sort({ name: 1 });
    return res.json({ success: true, medicines });
  } catch (error) {
    return next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const order = await ChemistOrder.create({
      ...req.body,
      chemistId: req.user.id,
      orderId: req.body.orderId || buildOrderId(),
      orderDate: req.body.orderDate || new Date(),
    });

    await pushNotification(req.user.id, 'new_order', 'New order received', `Order ${order.orderId} received from ${order.patientName}.`, { orderId: order._id });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    const { tab = 'all' } = req.query;
    const filter = { chemistId: req.user.id };

    if (tab === 'new') filter.status = 'Pending';
    if (tab === 'active') filter.status = { $in: ['Processing', 'Dispatched'] };
    if (tab === 'completed') filter.status = 'Delivered';
    if (tab === 'cancelled') filter.status = 'Cancelled';

    const orders = await ChemistOrder.find(filter).sort({ orderDate: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const { status } = req.body;
    const allowed = ['Pending', 'Processing', 'Dispatched', 'Delivered'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid order status' });

    const order = await ChemistOrder.findOneAndUpdate(
      { _id: req.params.id, chemistId: req.user.id },
      { status },
      { new: true },
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'Delivered' && String(order.paymentStatus).toLowerCase() !== 'paid') {
      order.paymentStatus = 'Paid';
      await order.save();
    }

    if (status === 'Delivered' && order.patientPhone) {
      await sendSms({
        to: order.patientPhone,
        message: `AID AI update: Your order ${order.orderId} has been delivered.`,
      });
    }

    if (status === 'Processing' && order.patientPhone) {
      await sendSms({
        to: order.patientPhone,
        message: `AID AI update: Your order ${order.orderId} is now being processed.`,
      });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const { reason = '' } = req.body;
    const order = await ChemistOrder.findOneAndUpdate(
      { _id: req.params.id, chemistId: req.user.id },
      { status: 'Cancelled', cancelReason: reason || 'Cancelled by chemist' },
      { new: true },
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await pushNotification(req.user.id, 'order_cancelled', 'Order cancelled', `Order ${order.orderId} was cancelled.`, { orderId: order._id });
    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
}

export async function reviewPrescription(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const { action, reason = '' } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    const update = action === 'approve'
      ? { prescriptionStatus: 'approved', prescriptionRejectReason: '' }
      : {
          prescriptionStatus: 'rejected',
          prescriptionRejectReason: reason || 'Prescription rejected by chemist',
          status: 'Cancelled',
          cancelReason: reason || 'Prescription rejected by chemist',
        };

    const order = await ChemistOrder.findOneAndUpdate(
      { _id: req.params.id, chemistId: req.user.id },
      update,
      { new: true },
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await pushNotification(
      req.user.id,
      'prescription_review',
      action === 'approve' ? 'Prescription approved' : 'Prescription rejected',
      `Prescription for order ${order.orderId} ${action === 'approve' ? 'approved' : 'rejected'}.`,
      { orderId: order._id, action },
    );

    if (order.patientPhone) {
      await sendSms({
        to: order.patientPhone,
        message:
          action === 'approve'
            ? `AID AI update: Prescription for order ${order.orderId} approved.`
            : `AID AI update: Prescription for order ${order.orderId} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
}

export async function getEarnings(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    const view = req.query.view || 'daily';
    const now = new Date();
    const start = new Date(now);

    if (view === 'daily') start.setHours(0, 0, 0, 0);
    if (view === 'weekly') start.setDate(now.getDate() - 7);
    if (view === 'monthly') start.setMonth(now.getMonth() - 1);

    const orders = await ChemistOrder.find({ chemistId: req.user.id }).sort({ orderDate: -1 });
    const paidOrders = orders.filter((order) => order.paymentStatus === 'Paid');
    const periodOrders = paidOrders.filter((order) => new Date(order.orderDate) >= start);
    const pendingOrders = orders.filter((order) => order.paymentStatus !== 'Paid');

    return res.json({
      success: true,
      totals: {
        daily: paidOrders
          .filter((order) => new Date(order.orderDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        weekly: paidOrders
          .filter((order) => new Date(order.orderDate) >= new Date(Date.now() - 7 * dayMs))
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        monthly: paidOrders
          .filter((order) => new Date(order.orderDate) >= new Date(Date.now() - 30 * dayMs))
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
      },
      periodView: view,
      periodTotal: periodOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
      history: paidOrders.map((order) => ({
        id: order._id,
        patientName: order.patientName,
        orderId: order.orderId,
        medicines: order.items.map((item) => item.medicineName).join(', '),
        amount: order.totalAmount,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        date: order.orderDate,
      })),
      pendingPayments: pendingOrders.map((order) => ({
        id: order._id,
        orderId: order.orderId,
        patientName: order.patientName,
        amount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    const orders = await ChemistOrder.find({ chemistId: req.user.id, status: { $ne: 'Cancelled' } });
    const medicines = await ChemistMedicine.find({ chemistId: req.user.id });

    const salesByMedicine = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        salesByMedicine[item.medicineName] = (salesByMedicine[item.medicineName] || 0) + Number(item.quantity || 0);
      });
    });

    const bestSelling = Object.entries(salesByMedicine)
      .map(([name, quantitySold]) => ({ name, quantitySold }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    const now = Date.now();
    const weeklyRevenue = orders
      .filter((order) => order.paymentStatus === 'Paid' && now - new Date(order.orderDate).getTime() <= 7 * dayMs)
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const monthlyRevenue = orders
      .filter((order) => order.paymentStatus === 'Paid' && now - new Date(order.orderDate).getTime() <= 30 * dayMs)
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const stockConsumption = medicines.map((medicine) => ({
      medicine: medicine.name,
      inStock: medicine.stockQuantity,
      estimatedSold: salesByMedicine[medicine.name] || 0,
    }));

    return res.json({
      success: true,
      reports: {
        bestSelling,
        weeklyRevenue,
        monthlyRevenue,
        stockConsumption,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function exportReports(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const { format = 'excel' } = req.query;
    const orders = await ChemistOrder.find({ chemistId: req.user.id }).sort({ orderDate: -1 });
    const rows = [
      ['Order ID', 'Patient', 'Status', 'Payment Status', 'Amount', 'Date'],
      ...orders.map((order) => [
        order.orderId,
        order.patientName,
        order.status,
        order.paymentStatus,
        order.totalAmount,
        new Date(order.orderDate).toLocaleString('en-IN'),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Disposition', `attachment; filename="chemist-report.${format === 'pdf' ? 'pdf' : 'csv'}"`);
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv');
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
}

export async function getChemistNotifications(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    await ensureSeedData(req.user.id);
    await syncInventoryAlerts(req.user.id);
    const notifications = await ChemistNotification.find({ chemistId: req.user.id }).sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, notifications });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    if (!roleGuard(req, res)) return;
    const notification = await ChemistNotification.findOneAndUpdate(
      { _id: req.params.id, chemistId: req.user.id },
      { read: true },
      { new: true },
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
}
