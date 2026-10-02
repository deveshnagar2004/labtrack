const express = require('express');

const router = express.Router();

const {
  listEquipment,
  getEquipment,
  addEquipment,
  editEquipment,
  removeEquipment,
  changeEquipmentStatus,
  scanQrCode,
  getQrImage
} = require('../controllers/equipmentController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET ALL EQUIPMENT
router.get(
  '/',
  protect,
  listEquipment
);

// RESOLVE EQUIPMENT FROM QR CODE
// Must come before /:id
router.get(
  '/qr/:code',
  protect,
  scanQrCode
);

// GENERATE QR IMAGE
// ADMIN and LAB_ASSISTANT only
// Must come before /:id
router.get(
  '/:id/qr-image',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  getQrImage
);

// GET EQUIPMENT BY ID
router.get(
  '/:id',
  protect,
  getEquipment
);

// CREATE EQUIPMENT
// ADMIN only
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  addEquipment
);

// UPDATE EQUIPMENT STATUS
// ADMIN or LAB_ASSISTANT
router.patch(
  '/:id/status',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  changeEquipmentStatus
);

// UPDATE EQUIPMENT
// ADMIN or LAB_ASSISTANT
router.patch(
  '/:id',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  editEquipment
);

// RETIRE EQUIPMENT
// ADMIN only
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  removeEquipment
);

module.exports = router;