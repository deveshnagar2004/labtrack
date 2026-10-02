const express = require('express');

const router = express.Router();

const {
  issueEquipment,
  returnEquipment,
  listTransactions,
  getTransaction
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Issue equipment - ADMIN or LAB_ASSISTANT only
router.post(
  '/issue',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  issueEquipment
);

// Return equipment - authenticated users
router.post(
  '/return',
  protect,
  returnEquipment
);

// List transactions - any authenticated user (controller scopes STUDENT to their own)
router.get(
  '/',
  protect,
  listTransactions
);

// Get transaction by ID - authenticated users
router.get(
  '/:id',
  protect,
  getTransaction
);

module.exports = router;
