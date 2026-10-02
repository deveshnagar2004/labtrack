const express = require('express');
const router = express.Router();
const { listUsers, getUser, editUser, removeUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('ADMIN'), listUsers);
router.get('/:id', protect, authorize('ADMIN'), getUser);
router.patch('/:id', protect, authorize('ADMIN'), editUser);
router.delete('/:id', protect, authorize('ADMIN'), removeUser);

module.exports = router;
