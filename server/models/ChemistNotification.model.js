import mongoose from 'mongoose';

const chemistNotificationSchema = new mongoose.Schema(
  {
    chemistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemist', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    alertKey: { type: String, default: '', index: true },
    read: { type: Boolean, default: false },
    meta: { type: Object, default: {} },
  },
  { timestamps: true },
);

chemistNotificationSchema.index({ chemistId: 1, createdAt: -1 });

export default mongoose.model('ChemistNotification', chemistNotificationSchema);
