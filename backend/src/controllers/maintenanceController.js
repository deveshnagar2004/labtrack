const {
  getAllMaintenance,
  getMaintenanceById,
  getOpenMaintenanceByEquipment,
  createMaintenance,
  completeMaintenance
} = require('../models/maintenanceModel');

const {
  getEquipmentById,
  updateEquipmentStatus
} = require('../models/equipmentModel');

const {
  getActiveTransactionByEquipment
} = require('../models/transactionModel');


const listMaintenance = async (req, res) => {
  try {
    const { status, equipment_id } = req.query;

    const records = await getAllMaintenance({
      status,
      equipment_id
    });

    res.json({
      success: true,
      message: 'Maintenance records fetched',
      data: records
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records',
      error: err.message
    });
  }
};


const getMaintenance = async (req, res) => {
  try {
    const record = await getMaintenanceById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
        error: `No record with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      message: 'Maintenance record fetched',
      data: record
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance record',
      error: err.message
    });
  }
};


const startMaintenance = async (req, res) => {
  try {
    const {
      equipment_id,
      technician_name,
      maintenance_type,
      description,
      cost,
      start_date
    } = req.body;

    if (!equipment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field',
        error: 'equipment_id is required'
      });
    }

    const equipment = await getEquipmentById(equipment_id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${equipment_id}`
      });
    }

    // Equipment cannot enter maintenance while it is issued.
    const activeTransaction =
      await getActiveTransactionByEquipment(equipment_id);

    if (activeTransaction) {
      return res.status(409).json({
        success: false,
        message: 'Cannot start maintenance',
        error: 'Equipment is currently issued to a user and must be returned first'
      });
    }

    // Prevent duplicate open maintenance jobs.
    const existingOpen =
      await getOpenMaintenanceByEquipment(equipment_id);

    if (existingOpen) {
      return res.status(409).json({
        success: false,
        message: 'Cannot start maintenance',
        error: 'This equipment already has an open maintenance record'
      });
    }

    const maintenanceId = await createMaintenance({
      equipment_id,
      technician_name,
      maintenance_type,
      description,
      cost,
      start_date:
        start_date || new Date().toISOString().slice(0, 10)
    });

    // Rule 9: equipment enters maintenance.
    await updateEquipmentStatus(
      equipment_id,
      'MAINTENANCE'
    );

    const created =
      await getMaintenanceById(maintenanceId);

    res.status(201).json({
      success: true,
      message: 'Maintenance started',
      data: created
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to start maintenance',
      error: err.message
    });
  }
};


const finishMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      completion_date,
      next_due_date,
      cost
    } = req.body;

    const record =
      await getMaintenanceById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
        error: `No record with id ${id}`
      });
    }

    if (record.status === 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'Completion failed',
        error: 'This maintenance record is already completed'
      });
    }

    const finalCompletionDate =
      completion_date ||
      new Date().toISOString().slice(0, 10);

    await completeMaintenance(id, {
      completion_date: finalCompletionDate,
      next_due_date,
      cost
    });

    // Rule 10: equipment becomes available again.
    await updateEquipmentStatus(
      record.equipment_id,
      'AVAILABLE'
    );

    const updated =
      await getMaintenanceById(id);

    res.json({
      success: true,
      message: 'Maintenance completed — equipment is now available',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete maintenance',
      error: err.message
    });
  }
};


module.exports = {
  listMaintenance,
  getMaintenance,
  startMaintenance,
  finishMaintenance
};
