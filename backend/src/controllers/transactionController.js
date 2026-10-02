const {
  getAllTransactions,
  getTransactionById,
  getActiveTransactionByEquipment,
  createTransaction,
  completeReturn
} = require('../models/transactionModel');

const {
  getEquipmentById,
  updateEquipmentStatus
} = require('../models/equipmentModel');

const {
  getBookingById,
  updateBookingStatus
} = require('../models/bookingModel');

const {
  createIssue
} = require('../models/issueModel');

const VALID_CONDITIONS = [
  'EXCELLENT',
  'GOOD',
  'FAIR',
  'POOR',
  'DAMAGED'
];

const NOT_ISSUABLE_STATUSES = [
  'DAMAGED',
  'LOST',
  'RETIRED',
  'MAINTENANCE'
];

// ISSUE EQUIPMENT
const issueEquipment = async (req, res) => {
  try {
    const {
      booking_id,
      issue_condition
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'booking_id is required'
      });
    }

    const booking = await getBookingById(booking_id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        error: `No booking with id ${booking_id}`
      });
    }

    if (booking.status !== 'APPROVED') {
      return res.status(409).json({
        success: false,
        message: 'Only APPROVED bookings can be issued',
        error: `Current booking status is ${booking.status}`
      });
    }

    const equipment = await getEquipmentById(
      booking.equipment_id
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${booking.equipment_id}`
      });
    }

    if (NOT_ISSUABLE_STATUSES.includes(equipment.status)) {
      return res.status(409).json({
        success: false,
        message: 'Equipment cannot be issued',
        error: `Equipment status is ${equipment.status}`
      });
    }

    const activeTransaction =
      await getActiveTransactionByEquipment(
        booking.equipment_id
      );

    if (activeTransaction) {
      return res.status(409).json({
        success: false,
        message: 'Equipment is already issued',
        error: `Active transaction exists with id ${activeTransaction.id}`
      });
    }

    const finalCondition =
      issue_condition || equipment.condition;

    if (!VALID_CONDITIONS.includes(finalCondition)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue condition',
        error: `issue_condition must be one of: ${VALID_CONDITIONS.join(', ')}`
      });
    }

    const transactionId = await createTransaction({
      equipment_id: booking.equipment_id,
      user_id: booking.user_id,
      booking_id: booking.id,
      issue_condition: finalCondition,
      issued_by: req.user.id
    });

    await updateEquipmentStatus(
      booking.equipment_id,
      'ISSUED'
    );

    await updateBookingStatus(
      booking.id,
      'COMPLETED',
      booking.approved_by
    );

    const transaction =
      await getTransactionById(transactionId);

    return res.status(201).json({
      success: true,
      message: 'Equipment issued successfully',
      data: transaction
    });

  } catch (err) {
    console.error('Issue equipment error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to issue equipment',
      error: err.message
    });
  }
};


// RETURN EQUIPMENT
const returnEquipment = async (req, res) => {
  try {
    const {
      equipment_id,
      return_condition,
      remarks
    } = req.body;

    if (!equipment_id || !return_condition) {
      return res.status(400).json({
        success: false,
        message: 'equipment_id and return_condition are required'
      });
    }

    if (!VALID_CONDITIONS.includes(return_condition)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid return condition',
        error: `return_condition must be one of: ${VALID_CONDITIONS.join(', ')}`
      });
    }

    const equipment = await getEquipmentById(
      equipment_id
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${equipment_id}`
      });
    }

    const transaction =
      await getActiveTransactionByEquipment(
        equipment_id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No active transaction found',
        error: 'This equipment is not currently issued'
      });
    }

    const isOwner =
      transaction.user_id === req.user.id;

    const isStaff =
      ['ADMIN', 'LAB_ASSISTANT'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to return this equipment',
        error: 'Only the borrower or authorized staff can return equipment'
      });
    }

    await completeReturn(
      transaction.id,
      {
        return_condition,
        remarks,
        returned_to: req.user.id
      }
    );

    let finalEquipmentStatus = 'AVAILABLE';

    if (
      return_condition === 'DAMAGED' ||
      return_condition === 'POOR'
    ) {
      finalEquipmentStatus = 'DAMAGED';

      await createIssue({
        equipment_id,
        reported_by: req.user.id,
        title: 'Equipment returned in damaged condition',
        description:
          remarks || `Equipment returned with condition: ${return_condition}`,
        severity:
          return_condition === 'DAMAGED'
            ? 'HIGH'
            : 'MEDIUM'
      });
    }

    await updateEquipmentStatus(
      equipment_id,
      finalEquipmentStatus
    );

    const updatedTransaction =
      await getTransactionById(transaction.id);

    const issuedAt =
      new Date(updatedTransaction.issued_at);

    const returnedAt =
      new Date(updatedTransaction.returned_at);

    const usageDurationHours =
      (
        returnedAt.getTime() -
        issuedAt.getTime()
      ) / (1000 * 60 * 60);

    return res.status(200).json({
      success: true,
      message: 'Equipment returned successfully',
      data: {
        transaction: updatedTransaction,
        usage_duration_hours:
          Number(usageDurationHours.toFixed(2))
      }
    });

  } catch (err) {
    console.error('Return equipment error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to return equipment',
      error: err.message
    });
  }
};


// LIST TRANSACTIONS
const listTransactions = async (req, res) => {
  try {
    const {
      equipment_id,
      user_id,
      active
    } = req.query;

    // Students can only ever see their own transaction history.
    const scopedUserId = req.user.role === 'STUDENT' ? req.user.id : user_id;

    const transactions =
      await getAllTransactions({
        equipment_id,
        user_id: scopedUserId,
        active
      });

    return res.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions
    });

  } catch (err) {
    console.error('List transactions error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: err.message
    });
  }
};


// GET SINGLE TRANSACTION
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction =
      await getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        error: `No transaction with id ${id}`
      });
    }

    return res.json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction
    });

  } catch (err) {
    console.error('Get transaction error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: err.message
    });
  }
};


module.exports = {
  issueEquipment,
  returnEquipment,
  listTransactions,
  getTransaction
};
