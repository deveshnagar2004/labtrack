const pool = require('../config/db');

const getAllMaintenance = async (filters = {}) => {
  let query = `
    SELECT m.*, e.name AS equipment_name, e.serial_number
    FROM maintenance_records m
    JOIN equipment e ON m.equipment_id = e.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.status) {
    query += ' AND m.status = ?';
    params.push(filters.status);
  }

  if (filters.equipment_id) {
    query += ' AND m.equipment_id = ?';
    params.push(filters.equipment_id);
  }

  query += ' ORDER BY m.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

const getMaintenanceById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      m.*,
      e.name AS equipment_name,
      e.serial_number,
      e.status AS equipment_status
    FROM maintenance_records m
    JOIN equipment e ON m.equipment_id = e.id
    WHERE m.id = ?
  `, [id]);

  return rows[0];
};

const getOpenMaintenanceByEquipment = async (equipment_id) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM maintenance_records
     WHERE equipment_id = ?
       AND status != 'COMPLETED'`,
    [equipment_id]
  );

  return rows[0];
};

const createMaintenance = async ({
  equipment_id,
  technician_name,
  maintenance_type,
  description,
  cost,
  start_date
}) => {
  const [result] = await pool.query(
    `INSERT INTO maintenance_records
      (
        equipment_id,
        technician_name,
        maintenance_type,
        description,
        cost,
        start_date,
        status
      )
     VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
    [
      equipment_id,
      technician_name || null,
      maintenance_type || null,
      description || null,
      cost || null,
      start_date || null
    ]
  );

  return result.insertId;
};

const updateMaintenanceStatus = async (id, status) => {
  await pool.query(
    'UPDATE maintenance_records SET status = ? WHERE id = ?',
    [status, id]
  );
};

const completeMaintenance = async (
  id,
  { completion_date, next_due_date, cost }
) => {
  await pool.query(
    `UPDATE maintenance_records
     SET
       status = 'COMPLETED',
       completion_date = ?,
       next_due_date = ?,
       cost = COALESCE(?, cost)
     WHERE id = ?`,
    [
      completion_date,
      next_due_date || null,
      cost,
      id
    ]
  );
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  getOpenMaintenanceByEquipment,
  createMaintenance,
  updateMaintenanceStatus,
  completeMaintenance
};
