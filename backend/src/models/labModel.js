const pool = require('../config/db');

const getAllLabs = async () => {
  const [rows] = await pool.query(`
    SELECT l.*, u.name AS assistant_name, u.email AS assistant_email
    FROM laboratories l
    LEFT JOIN users u ON l.lab_assistant_id = u.id
    ORDER BY l.name
  `);

  return rows;
};

const getLabById = async (id) => {
  const [rows] = await pool.query(`
    SELECT l.*, u.name AS assistant_name, u.email AS assistant_email
    FROM laboratories l
    LEFT JOIN users u ON l.lab_assistant_id = u.id
    WHERE l.id = ?
  `, [id]);

  return rows[0];
};

const createLab = async ({
  name,
  department,
  location,
  description,
  lab_assistant_id
}) => {
  const [result] = await pool.query(
    `INSERT INTO laboratories
      (name, department, location, description, lab_assistant_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      name,
      department || null,
      location || null,
      description || null,
      lab_assistant_id || null
    ]
  );

  return result.insertId;
};

const updateLab = async (
  id,
  {
    name,
    department,
    location,
    description,
    lab_assistant_id
  }
) => {
  await pool.query(
    `UPDATE laboratories
     SET name = ?,
         department = ?,
         location = ?,
         description = ?,
         lab_assistant_id = ?
     WHERE id = ?`,
    [
      name,
      department || null,
      location || null,
      description || null,
      lab_assistant_id || null,
      id
    ]
  );
};

const deleteLab = async (id) => {
  await pool.query(
    'DELETE FROM laboratories WHERE id = ?',
    [id]
  );
};

const countEquipmentInLab = async (id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM equipment WHERE lab_id = ?',
    [id]
  );

  return rows[0].count;
};

module.exports = {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  countEquipmentInLab
};
