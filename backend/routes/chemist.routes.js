import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  cancelOrder,
  createInventoryItem,
  createOrder,
  deleteInventoryItem,
  exportReports,
  getCatalogue,
  getChemistNotifications,
  getChemistProfile,
  getEarnings,
  getInventory,
  getOrders,
  getReports,
  markNotificationRead,
  reviewPrescription,
  updateChemistProfile,
  updateInventoryItem,
  updateOrderStatus,
} from '../controllers/chemist.controller.js';

const router = Router();

router.use(authenticate, requireRole('chemist'));

router.get('/profile', getChemistProfile);
router.put('/profile', updateChemistProfile);

router.get('/inventory', getInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

router.get('/catalogue', getCatalogue);

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/cancel', cancelOrder);
router.put('/orders/:id/prescription', reviewPrescription);

router.get('/earnings', getEarnings);
router.get('/reports', getReports);
router.get('/reports/export', exportReports);

router.get('/notifications', getChemistNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
