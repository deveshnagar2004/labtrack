const express = require('express');

const router = express.Router();

const {
  dashboardSummary,
  equipmentUtilization,
  maintenanceStats,
  bookingStats
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Dashboard analytics
router.get(
  '/dashboard',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  dashboardSummary
);

// Equipment utilization analytics
router.get(
  '/equipment-utilization',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  equipmentUtilization
);

// Maintenance analytics
router.get(
  '/maintenance',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  maintenanceStats
);

// Booking analytics
router.get(
  '/bookings',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  bookingStats
);

module.exports = router;
