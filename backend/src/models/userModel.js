const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  return rows[0];
};

const createUser = async ({ name, email, passwordHash, role, phone }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, phone || null]
  );

  return result.insertId;
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, phone, is_active, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

const findUserByIdAndRole = async (id, role) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = ? AND role = ?',
    [id, role]
  );

  return rows[0];
};

const getAllUsers = async (filters = {}) => {
  let query = `
    SELECT id, name, email, role, phone, is_active, created_at
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (filters.role) {
    query += ' AND role = ?';
    params.push(filters.role);
  }

  if (filters.search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    const like = `%${filters.search}%`;
    params.push(like, like);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

const updateUserRoleAndStatus = async (id, { role, is_active }) => {
  await pool.query(
    'UPDATE users SET role = ?, is_active = ? WHERE id = ?',
    [role, is_active, id]
  );
};

const deactivateUser = async (id) => {
  await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  findUserByIdAndRole,
  getAllUsers,
  updateUserRoleAndStatus,
  deactivateUser
};