const express = require('express');
const router = express.Router();

const {
  listCategories,
  addCategory,
  editCategory,
  removeCategory
} = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, listCategories);
router.post('/', protect, authorize('ADMIN'), addCategory);
router.patch('/:id', protect, authorize('ADMIN'), editCategory);
router.delete('/:id', protect, authorize('ADMIN'), removeCategory);

module.exports = router;