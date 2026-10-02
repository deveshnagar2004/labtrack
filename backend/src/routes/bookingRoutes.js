const express = require('express');
const router = express.Router();

const {
  listBookings,
  myBookings,
  getBooking,
  requestBooking,
  approveBooking,
  rejectBooking,
  cancelBooking
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Request a new booking
router.post('/', protect, requestBooking);

// Admin / Lab Assistant: view all bookings
router.get(
  '/',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  listBookings
);

// Current user's bookings
// IMPORTANT: must be before /:id
router.get('/my', protect, myBookings);

// Get booking by ID
router.get('/:id', protect, getBooking);

// Approve booking
router.patch(
  '/:id/approve',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  approveBooking
);

// Reject booking
router.patch(
  '/:id/reject',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  rejectBooking
);

// Cancel booking
router.delete('/:id', protect, cancelBooking);

module.exports = router;
