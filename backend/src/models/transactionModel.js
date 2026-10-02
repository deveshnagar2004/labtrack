const pool = require('../config/db');

const getAllTransactions = async (filters = {}) => {
  let query = `
    SELECT
      t.*,
      e.name AS equipment_name,
      e.serial_number,
      u.name AS user_name
    FROM equipment_transactions t
    JOIN equipment e
      ON t.equipment_id = e.id
    JOIN users u
      ON t.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.equipment_id) {
    query += ' AND t.equipment_id = ?';
    params.push(filters.equipment_id);
  }

  if (filters.user_id) {
    query += ' AND t.user_id = ?';
    params.push(filters.user_id);
  }

  if (filters.active === 'true') {
    query += ' AND t.returned_at IS NULL';
  }

  query += ' ORDER BY t.created_at DESC';

  const [rows] = await pool.query(query, params);

  return rows;
};

const getTransactionById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      t.*,
      e.name AS equipment_name,
      e.serial_number,
      u.name AS user_name
    FROM equipment_transactions t
    JOIN equipment e
      ON t.equipment_id = e.id
    JOIN users u
      ON t.user_id = u.id
    WHERE t.id = ?
    `,
    [id]
  );

  return rows[0];
};

const getActiveTransactionByEquipment = async (equipment_id) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM equipment_transactions
    WHERE equipment_id = ?
      AND returned_at IS NULL
    `,
    [equipment_id]
  );

  return rows[0];
};

const createTransaction = async ({
  equipment_id,
  user_id,
  booking_id,
  issue_condition,
  issued_by
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO equipment_transactions
      (
        equipment_id,
        user_id,
        booking_id,
        issued_at,
        issue_condition,
        issued_by
      )
    VALUES (?, ?, ?, NOW(), ?, ?)
    `,
    [
      equipment_id,
      user_id,
      booking_id || null,
      issue_condition,
      issued_by
    ]
  );

  return result.insertId;
};

const completeReturn = async (
  id,
  {
    return_condition,
    remarks,
    returned_to
  }
) => {
  await pool.query(
    `
    UPDATE equipment_transactions
    SET
      returned_at = NOW(),
      return_condition = ?,
      remarks = ?,
      returned_to = ?
    WHERE id = ?
    `,
    [
      return_condition,
      remarks || null,
      returned_to,
      id
    ]
  );
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getActiveTransactionByEquipment,
  createTransaction,
  completeReturn
};