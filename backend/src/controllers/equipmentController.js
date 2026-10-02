const {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByQrCode,
  findBySerialNumber,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment
} = require('../models/equipmentModel');

const {
  generateQrIdentifier,
  generateQrImage
} = require('../services/qrService');

const VALID_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

// GET ALL EQUIPMENT
const listEquipment = async (req, res) => {
  try {
    const { status, category_id, lab_id, search } = req.query;

    const equipment = await getAllEquipment({
      status,
      category_id,
      lab_id,
      search
    });

    res.json({
      success: true,
      message: 'Equipment fetched',
      data: equipment
    });
  } catch (err) {
    console.error('List equipment error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: err.message
    });
  }
};

// GET EQUIPMENT BY ID
const getEquipment = async (req, res) => {
  try {
    const equipment = await getEquipmentById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      message: 'Equipment fetched',
      data: equipment
    });
  } catch (err) {
    console.error('Get equipment error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: err.message
    });
  }
};

// CREATE EQUIPMENT
const addEquipment = async (req, res) => {
  try {
    const {
      lab_id,
      category_id,
      name,
      serial_number,
      condition
    } = req.body;

    if (!lab_id || !category_id || !name || !serial_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'lab_id, category_id, name, and serial_number are required'
      });
    }

    if (condition && !VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid condition value',
        error: `condition must be one of: ${VALID_CONDITIONS.join(', ')}`
      });
    }

    const existing = await findBySerialNumber(serial_number);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Equipment creation failed',
        error: 'Serial number already exists'
      });
    }

    // Generate a unique QR identifier automatically
    const qr_code = generateQrIdentifier();

    const id = await createEquipment({
      ...req.body,
      qr_code
    });

    const created = await getEquipmentById(id);

    res.status(201).json({
      success: true,
      message: 'Equipment created',
      data: created
    });
  } catch (err) {
    console.error('Create equipment error:', err);

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Equipment creation failed',
        error: 'Invalid lab_id or category_id — referenced record does not exist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: err.message
    });
  }
};

// RESOLVE EQUIPMENT FROM QR CODE
const scanQrCode = async (req, res) => {
  try {
    const { code } = req.params;

    const equipment = await getEquipmentByQrCode(code);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: 'No equipment matches this QR code — it may be invalid or unregistered'
      });
    }

    res.json({
      success: true,
      message: 'Equipment resolved from QR code',
      data: equipment
    });
  } catch (err) {
    console.error('QR scan error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to resolve QR code',
      error: err.message
    });
  }
};

// GENERATE QR IMAGE
const getQrImage = async (req, res) => {
  try {
    const equipment = await getEquipmentById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${req.params.id}`
      });
    }

    if (!equipment.qr_code) {
      return res.status(409).json({
        success: false,
        message: 'QR generation failed',
        error: 'This equipment does not have a QR code assigned'
      });
    }

    const imageDataUrl = await generateQrImage(equipment.qr_code);

    res.json({
      success: true,
      message: 'QR image generated',
      data: {
        equipment_id: equipment.id,
        qr_code: equipment.qr_code,
        qr_image: imageDataUrl
      }
    });
  } catch (err) {
    console.error('QR image generation error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to generate QR image',
      error: err.message
    });
  }
};

// UPDATE EQUIPMENT
const editEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getEquipmentById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${id}`
      });
    }

    const { condition } = req.body;

    if (condition && !VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid condition value',
        error: `condition must be one of: ${VALID_CONDITIONS.join(', ')}`
      });
    }

    await updateEquipment(id, req.body);

    const updated = await getEquipmentById(id);

    res.json({
      success: true,
      message: 'Equipment updated',
      data: updated
    });
  } catch (err) {
    console.error('Update equipment error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: err.message
    });
  }
};

// RETIRE EQUIPMENT
const removeEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getEquipmentById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${id}`
      });
    }

    await deleteEquipment(id);

    res.json({
      success: true,
      message: 'Equipment retired successfully',
      data: {
        id: Number(id),
        status: 'RETIRED'
      }
    });
  } catch (err) {
    console.error('Retire equipment error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to retire equipment',
      error: err.message
    });
  }
};

// UPDATE EQUIPMENT STATUS
const changeEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = [
      'AVAILABLE',
      'BOOKED',
      'ISSUED',
      'MAINTENANCE',
      'DAMAGED',
      'LOST',
      'RETIRED'
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment status',
        error: `status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existing = await getEquipmentById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        error: `No equipment with id ${id}`
      });
    }

    await updateEquipmentStatus(id, status);

    const updated = await getEquipmentById(id);

    res.json({
      success: true,
      message: 'Equipment status updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Update equipment status error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update equipment status',
      error: err.message
    });
  }
};

// EXPORT CONTROLLERS
module.exports = {
  listEquipment,
  getEquipment,
  addEquipment,
  editEquipment,
  removeEquipment,
  changeEquipmentStatus,
  scanQrCode,
  getQrImage
};
