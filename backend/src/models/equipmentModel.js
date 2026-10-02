const pool = require('../config/db');

// ==========================================
// GET ALL EQUIPMENT
// ==========================================
const getAllEquipment = async (filters = {}) => {
  let query = `
    SELECT
      e.*,
      c.name AS category_name,
      l.name AS lab_name
    FROM equipment e
    JOIN equipment_categories c
      ON e.category_id = c.id
    JOIN laboratories l
      ON e.lab_id = l.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.status) {
    query += ' AND e.status = ?';
    params.push(filters.status);
  }

  if (filters.category_id) {
    query += ' AND e.category_id = ?';
    params.push(filters.category_id);
  }

  if (filters.lab_id) {
    query += ' AND e.lab_id = ?';
    params.push(filters.lab_id);
  }

  if (filters.search) {
    query += `
      AND (
        e.name LIKE ?
        OR e.manufacturer LIKE ?
        OR e.serial_number LIKE ?
      )
    `;

    const like = `%${filters.search}%`;

    params.push(like, like, like);
  }

  query += ' ORDER BY e.created_at DESC';

  const [rows] = await pool.query(query, params);

  return rows;
};

// ==========================================
// GET EQUIPMENT BY ID
// ==========================================
const getEquipmentById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       e.*,
       c.name AS category_name,
       l.name AS lab_name
     FROM equipment e
     JOIN equipment_categories c
       ON e.category_id = c.id
     JOIN laboratories l
       ON e.lab_id = l.id
     WHERE e.id = ?`,
    [id]
  );

  return rows[0];
};

// ==========================================
// FIND BY SERIAL NUMBER
// ==========================================
const findBySerialNumber = async (serial_number) => {
  const [rows] = await pool.query(
    'SELECT * FROM equipment WHERE serial_number = ?',
    [serial_number]
  );

  return rows[0];
};

// ==========================================
// CREATE EQUIPMENT
// ==========================================
const createEquipment = async (data) => {
  const {
    lab_id,
    category_id,
    name,
    serial_number,
    model_number,
    manufacturer,
    purchase_date,
    purchase_cost,
    condition,
    description,
    qr_code
  } = data;

  const [result] = await pool.query(
    `INSERT INTO equipment
      (
        lab_id,
        category_id,
        name,
        serial_number,
        model_number,
        manufacturer,
        purchase_date,
        purchase_cost,
        \`condition\`,
        description,
        qr_code
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lab_id,
      category_id,
      name,
      serial_number,
      model_number || null,
      manufacturer || null,
      purchase_date || null,
      purchase_cost || null,
      condition || 'GOOD',
      description || null,
      qr_code || null
    ]
  );

  return result.insertId;
};
const getEquipmentByQrCode = async (qr_code) => {
  const [rows] = await pool.query(
    `SELECT
       e.*,
       c.name AS category_name,
       l.name AS lab_name
     FROM equipment e
     JOIN equipment_categories c ON e.category_id = c.id
     JOIN laboratories l ON e.lab_id = l.id
     WHERE e.qr_code = ?`,
    [qr_code]
  );

  return rows[0];
};

// ==========================================
// UPDATE EQUIPMENT
// ==========================================
const updateEquipment = async (id, data) => {
  const {
    lab_id,
    category_id,
    name,
    model_number,
    manufacturer,
    purchase_date,
    purchase_cost,
    condition,
    description
  } = data;

  await pool.query(
    `UPDATE equipment SET
      lab_id = ?,
      category_id = ?,
      name = ?,
      model_number = ?,
      manufacturer = ?,
      purchase_date = ?,
      purchase_cost = ?,
      \`condition\` = ?,
      description = ?
     WHERE id = ?`,
    [
      lab_id,
      category_id,
      name,
      model_number || null,
      manufacturer || null,
      purchase_date || null,
      purchase_cost || null,
      condition,
      description || null,
      id
    ]
  );
};

// ==========================================
// UPDATE STATUS
// ==========================================
const updateEquipmentStatus = async (id, status) => {
  await pool.query(
    'UPDATE equipment SET status = ? WHERE id = ?',
    [status, id]
  );
};

// ==========================================
// SOFT DELETE / RETIRE
// ==========================================
const deleteEquipment = async (id) => {
  await pool.query(
    "UPDATE equipment SET status = 'RETIRED' WHERE id = ?",
    [id]
  );
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByQrCode,
  findBySerialNumber,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment
};
