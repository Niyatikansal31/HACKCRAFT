import mongoose from 'mongoose';

const chemistOrderItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChemistMedicine' },
    medicineName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    prescriptionRequired: { type: Boolean, default: false },
  },
  { _id: false },
);

const chemistOrderSchema = new mongoose.Schema(
  {
    chemistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemist', required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    patientPhoto: { type: String, default: '' },
    items: { type: [chemistOrderItemSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    paymentMode: { type: String, enum: ['Online', 'Cash'], default: 'Online' },
    fulfillmentType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    deliveryAddress: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    cancelReason: { type: String, default: '' },
    prescriptionFileUrl: { type: String, default: '' },
    prescriptionStatus: {
      type: String,
      enum: ['not_required', 'pending', 'approved', 'rejected'],
      default: 'not_required',
    },
    prescriptionRejectReason: { type: String, default: '' },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

chemistOrderSchema.index({ chemistId: 1, orderDate: -1 });

export default mongoose.model('ChemistOrder', chemistOrderSchema);
