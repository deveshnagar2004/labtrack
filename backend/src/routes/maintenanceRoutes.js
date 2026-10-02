const express = require('express');
const router = express.Router();

const {
  listMaintenance,
  getMaintenance,
  startMaintenance,
  finishMaintenance
} = require('../controllers/maintenanceController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post(
  '/',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  startMaintenance
);

router.get(
  '/',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  listMaintenance
);

router.get(
  '/:id',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  getMaintenance
);

router.patch(
  '/:id',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  finishMaintenance
);

module.exports = router;
