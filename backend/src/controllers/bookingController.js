const {
  getAllBookings,
  getBookingsByUser,
  getBookingById,
  findConflictingBookings,
  findUserTimeConflicts,
  createBooking,
  updateBookingStatus
} = require('../models/bookingModel');

const {
  getEquipmentById
} = require('../models/equipmentModel');

const NON_BOOKABLE_STATUSES = [
  'MAINTENANCE',
  'DAMAGED',
  'LOST',
  'RETIRED'
];

// GET ALL BOOKINGS
const listBookings = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      equipment_id: req.query.equipment_id
    };

    const bookings = await getAllBookings(filters);

    res.json({
      success: true,
      message: 'Bookings fetched successfully',
      data: bookings
    });
  } catch (err) {
    console.error('List bookings error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: err.message
    });
  }
};

// GET MY BOOKINGS
const myBookings = async (req, res) => {
  try {
    const bookings = await getBookingsByUser(req.user.id);

    res.json({
      success: true,
      message: 'Your bookings fetched successfully',
      data: bookings
    });
  } catch (err) {
    console.error('My bookings error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings',
      error: err.message
    });
  }
};

// GET BOOKING BY ID
const getBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        error: `No booking with id ${req.params.id}`
      });
    }

    // Students can only view their own bookings
    if (
      req.user.role === 'STUDENT' &&
      booking.user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'You can only view your own bookings'
      });
    }

    res.json({
      success: true,
      message: 'Booking fetched successfully',
      data: booking
    });
  } catch (err) {
    console.error('Get booking error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: err.message
    });
  }
};

// REQUEST BOOKING
const requestBooking = async (req, res) => {
  try {
    const {
      equipment_id,
      start_time,
      end_time,
      purpose
    } = req.body;

    // Validate required fields
    if (!equipment_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'equipment_id, start_time, and end_time are required'
      });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const now = new Date();

    // Validate dates
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking time',
        error: 'start_time and end_time must be valid dates'
      });
    }

    // Start time cannot be in the past
    if (startDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking time',
        error: 'start_time cannot be in the past'
      });
    }

    // End time must be after start time
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking time',
        error: 'end_time must be after start_time'
      });
    }

    // Check equipment
    const equipment = await getEquipmentById(equipment_id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${equipment_id}`
      });
    }

    // Check equipment status
    if (NON_BOOKABLE_STATUSES.includes(equipment.status)) {
      return res.status(409).json({
        success: false,
        message: 'Equipment is not available for booking',
        error: `Equipment status is ${equipment.status}`
      });
    }

    // Check equipment time conflict
    const equipmentConflicts = await findConflictingBookings(
      equipment_id,
      start_time,
      end_time
    );

    if (equipmentConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Equipment already booked for this time',
        error: `Conflicts with booking ${equipmentConflicts[0].id}`,
        data: {
          conflicting_booking_id: equipmentConflicts[0].id
        }
      });
    }

    // Check user time conflict
    const userConflicts = await findUserTimeConflicts(
      req.user.id,
      start_time,
      end_time
    );

    if (userConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking during this time',
        error: `Conflicts with booking ${userConflicts[0].id}`,
        data: {
          conflicting_booking_id: userConflicts[0].id
        }
      });
    }

    // Create booking
    const id = await createBooking({
      equipment_id,
      user_id: req.user.id,
      start_time,
      end_time,
      purpose
    });

    const booking = await getBookingById(id);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: booking
    });
  } catch (err) {
    console.error('Request booking error:', err);

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Booking creation failed',
        error: 'Invalid equipment_id or user_id'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: err.message
    });
  }
};

// APPROVE BOOKING
const approveBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        error: `No booking with id ${req.params.id}`
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(409).json({
        success: false,
        message: 'Booking cannot be approved',
        error: `Booking status is ${booking.status}`
      });
    }

    // Re-check equipment availability
    if (NON_BOOKABLE_STATUSES.includes(booking.equipment_status)) {
      return res.status(409).json({
        success: false,
        message: 'Equipment is not available for booking',
        error: `Equipment status is ${booking.equipment_status}`
      });
    }

    // Re-check equipment conflict
    const conflicts = await findConflictingBookings(
      booking.equipment_id,
      booking.start_time,
      booking.end_time,
      booking.id
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Booking cannot be approved because the equipment time conflicts',
        error: `Conflicts with booking ${conflicts[0].id}`,
        data: {
          conflicting_booking_id: conflicts[0].id
        }
      });
    }

    await updateBookingStatus(
      booking.id,
      'APPROVED',
      req.user.id
    );

    const updatedBooking = await getBookingById(booking.id);

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: updatedBooking
    });
  } catch (err) {
    console.error('Approve booking error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
      error: err.message
    });
  }
};

// REJECT BOOKING
const rejectBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        error: `No booking with id ${req.params.id}`
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(409).json({
        success: false,
        message: 'Booking cannot be rejected',
        error: `Booking status is ${booking.status}`
      });
    }

    await updateBookingStatus(
      booking.id,
      'REJECTED',
      req.user.id
    );

    const updatedBooking = await getBookingById(booking.id);

    res.json({
      success: true,
      message: 'Booking rejected successfully',
      data: updatedBooking
    });
  } catch (err) {
    console.error('Reject booking error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to reject booking',
      error: err.message
    });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        error: `No booking with id ${req.params.id}`
      });
    }

    // Student can only cancel own booking
    if (
      req.user.role === 'STUDENT' &&
      booking.user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'You can only cancel your own bookings'
      });
    }

    // Only PENDING or APPROVED can be cancelled
    if (!['PENDING', 'APPROVED'].includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message: 'Booking cannot be cancelled',
        error: `Booking status is ${booking.status}`
      });
    }

    await updateBookingStatus(
      booking.id,
      'CANCELLED',
      null
    );

    const updatedBooking = await getBookingById(booking.id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (err) {
    console.error('Cancel booking error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: err.message
    });
  }
};

module.exports = {
  listBookings,
  myBookings,
  getBooking,
  requestBooking,
  approveBooking,
  rejectBooking,
  cancelBooking
};