const express = require('express');
const router = express.Router();

const {
  listLabs,
  getLab,
  addLab,
  editLab,
  removeLab
} = require('../controllers/labController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, listLabs);

router.get('/:id', protect, getLab);

router.post(
  '/',
  protect,
  authorize('ADMIN'),
  addLab
);

router.patch(
  '/:id',
  protect,
  authorize('ADMIN'),
  editLab
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  removeLab
);

module.exports = router;
