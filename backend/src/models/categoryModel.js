const pool = require('../config/db');

const getAllCategories = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM equipment_categories ORDER BY name'
  );

  return rows;
};

const getCategoryById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM equipment_categories WHERE id = ?',
    [id]
  );

  return rows[0];
};

const findCategoryByName = async (name) => {
  const [rows] = await pool.query(
    'SELECT * FROM equipment_categories WHERE name = ?',
    [name]
  );

  return rows[0];
};

const createCategory = async ({ name, description }) => {
  const [result] = await pool.query(
    'INSERT INTO equipment_categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );

  return result.insertId;
};

const updateCategory = async (id, { name, description }) => {
  await pool.query(
    'UPDATE equipment_categories SET name = ?, description = ? WHERE id = ?',
    [name, description || null, id]
  );
};

const deleteCategory = async (id) => {
  await pool.query(
    'DELETE FROM equipment_categories WHERE id = ?',
    [id]
  );
};

module.exports = {
  getAllCategories,
  getCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory
};