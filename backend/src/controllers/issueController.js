const { createIssue, getAllIssues, getIssueById, updateIssueStatus } = require('../models/issueModel');
const { getEquipmentById } = require('../models/equipmentModel');

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const reportIssue = async (req, res) => {
  try {
    const { equipment_id, title, description, severity } = req.body;

    if (!equipment_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'equipment_id and title are required'
      });
    }

    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity',
        error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}`
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

    const issueId = await createIssue({
      equipment_id,
      reported_by: req.user.id,
      title,
      description,
      severity
    });

    const created = await getIssueById(issueId);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: created
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: err.message
    });
  }
};

const listIssues = async (req, res) => {
  try {
    const { status, equipment_id } = req.query;

    const filters = {
      status,
      equipment_id
    };

    // Students can only see issues reported by themselves.
    if (req.user.role === 'STUDENT') {
      filters.reported_by = req.user.id;
    }

    const issues = await getAllIssues(filters);

    res.json({
      success: true,
      message: 'Issues fetched',
      data: issues
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: err.message
    });
  }
};

const getIssue = async (req, res) => {
  try {
    const issue = await getIssueById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
        error: `No issue with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      message: 'Issue fetched',
      data: issue
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: err.message
    });
  }
};

const editIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        error: `status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const issue = await getIssueById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
        error: `No issue with id ${id}`
      });
    }

    await updateIssueStatus(
      id,
      status,
      status === 'RESOLVED' ? req.user.id : null
    );

    const updated = await getIssueById(id);

    res.json({
      success: true,
      message: 'Issue status updated',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update issue status',
      error: err.message
    });
  }
};

module.exports = {
  reportIssue,
  listIssues,
  getIssue,
  editIssueStatus
};