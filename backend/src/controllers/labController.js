const {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  countEquipmentInLab
} = require('../models/labModel');

const {
  findUserByIdAndRole
} = require('../models/userModel');

const validateAssistant = async (lab_assistant_id) => {
  if (!lab_assistant_id) {
    return { valid: true };
  }

  const user = await findUserByIdAndRole(
    lab_assistant_id,
    'LAB_ASSISTANT'
  );

  if (!user) {
    return {
      valid: false,
      error:
        'lab_assistant_id must reference an existing user with role LAB_ASSISTANT'
    };
  }

  return { valid: true };
};

const listLabs = async (req, res) => {
  try {
    const labs = await getAllLabs();

    res.json({
      success: true,
      message: 'Laboratories fetched',
      data: labs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch laboratories',
      error: err.message
    });
  }
};

const getLab = async (req, res) => {
  try {
    const lab = await getLabById(req.params.id);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
        error: `No lab with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      message: 'Laboratory fetched',
      data: lab
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch laboratory',
      error: err.message
    });
  }
};

const addLab = async (req, res) => {
  try {
    const {
      name,
      department,
      location,
      description,
      lab_assistant_id
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field',
        error: 'name is required'
      });
    }

    const check = await validateAssistant(lab_assistant_id);

    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory creation failed',
        error: check.error
      });
    }

    const id = await createLab({
      name,
      department,
      location,
      description,
      lab_assistant_id
    });

    const created = await getLabById(id);

    res.status(201).json({
      success: true,
      message: 'Laboratory created',
      data: created
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create laboratory',
      error: err.message
    });
  }
};

const editLab = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getLabById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
        error: `No lab with id ${id}`
      });
    }

    const {
      name,
      department,
      location,
      description,
      lab_assistant_id
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field',
        error: 'name is required'
      });
    }

    const check = await validateAssistant(lab_assistant_id);

    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory update failed',
        error: check.error
      });
    }

    await updateLab(id, {
      name,
      department,
      location,
      description,
      lab_assistant_id
    });

    const updated = await getLabById(id);

    res.json({
      success: true,
      message: 'Laboratory updated',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update laboratory',
      error: err.message
    });
  }
};

const removeLab = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getLabById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
        error: `No lab with id ${id}`
      });
    }

    const equipmentCount = await countEquipmentInLab(id);

    if (equipmentCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Failed to delete laboratory',
        error:
          `This lab still has ${equipmentCount} equipment item(s) assigned to it. ` +
          'Reassign or retire them first.'
      });
    }

    await deleteLab(id);

    res.json({
      success: true,
      message: 'Laboratory deleted',
      data: {
        id: Number(id)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete laboratory',
      error: err.message
    });
  }
};

module.exports = {
  listLabs,
  getLab,
  addLab,
  editLab,
  removeLab
};
