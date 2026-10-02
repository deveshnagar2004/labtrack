const pool = require('../config/db');

const createIssue = async ({
  equipment_id,
  reported_by,
  title,
  description,
  severity
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO equipment_issues
      (
        equipment_id,
        reported_by,
        title,
        description,
        severity
      )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      equipment_id,
      reported_by,
      title,
      description || null,
      severity || 'MEDIUM'
    ]
  );

  return result.insertId;
};

const getAllIssues = async (filters = {}) => {
  let query = `
    SELECT
      i.*,
      e.name AS equipment_name,
      u.name AS reported_by_name
    FROM equipment_issues i
    JOIN equipment e
      ON i.equipment_id = e.id
    JOIN users u
      ON i.reported_by = u.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.status) {
    query += ' AND i.status = ?';
    params.push(filters.status);
  }

  if (filters.equipment_id) {
    query += ' AND i.equipment_id = ?';
    params.push(filters.equipment_id);
  }

  if (filters.reported_by) {
    query += ' AND i.reported_by = ?';
    params.push(filters.reported_by);
  }

  query += ' ORDER BY i.created_at DESC';

  const [rows] = await pool.query(query, params);

  return rows;
};

const getIssueById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      i.*,
      e.name AS equipment_name,
      u.name AS reported_by_name
    FROM equipment_issues i
    JOIN equipment e
      ON i.equipment_id = e.id
    JOIN users u
      ON i.reported_by = u.id
    WHERE i.id = ?
    `,
    [id]
  );

  return rows[0];
};

const updateIssueStatus = async (
  id,
  status,
  resolved_by = null
) => {
  if (status === 'RESOLVED') {
    await pool.query(
      `
      UPDATE equipment_issues
      SET
        status = ?,
        resolved_at = NOW(),
        resolved_by = ?
      WHERE id = ?
      `,
      [
        status,
        resolved_by,
        id
      ]
    );
  } else {
    await pool.query(
      `
      UPDATE equipment_issues
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        id
      ]
    );
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueStatus
};