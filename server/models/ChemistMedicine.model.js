import mongoose from 'mongoose';

const chemistMedicineSchema = new mongoose.Schema(
  {
    chemistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemist', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    composition: { type: String, default: '' },
    dosage: { type: String, default: '' },
    batchNumber: { type: String, required: true, trim: true },
    supplierName: { type: String, default: '' },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate: { type: Date, required: true },
    description: { type: String, default: '' },
    usageInstructions: { type: String, default: '' },
    image: { type: String, default: '' },
    isPublicVisible: { type: Boolean, default: true },
    availabilityStatus: {
      type: String,
      enum: ['available', 'out_of_stock'],
      default: 'available',
    },
    isPrescriptionRequired: { type: Boolean, default: false },
  },
  { timestamps: true },
);

chemistMedicineSchema.index({ chemistId: 1, name: 1 });
chemistMedicineSchema.index({ chemistId: 1, category: 1 });

export default mongoose.model('ChemistMedicine', chemistMedicineSchema);
