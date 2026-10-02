const {
  getAllCategories,
  getCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../models/categoryModel');

// ==========================================
// GET ALL CATEGORIES
// ==========================================
const listCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.json({
      success: true,
      message: 'Categories fetched',
      data: categories
    });
  } catch (err) {
    console.error('List categories error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};

// ==========================================
// CREATE CATEGORY
// ==========================================
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field',
        error: 'name is required'
      });
    }

    const existing = await findCategoryByName(name);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category creation failed',
        error: 'Category name already exists'
      });
    }

    const id = await createCategory({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: {
        id,
        name,
        description
      }
    });
  } catch (err) {
    console.error('Create category error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err.message
    });
  }
};

// ==========================================
// UPDATE CATEGORY
// ==========================================
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await getCategoryById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: `No category with id ${id}`
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field',
        error: 'name is required'
      });
    }

    await updateCategory(id, {
      name,
      description
    });

    res.json({
      success: true,
      message: 'Category updated',
      data: {
        id: Number(id),
        name,
        description
      }
    });
  } catch (err) {
    console.error('Update category error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: err.message
    });
  }
};

// ==========================================
// DELETE CATEGORY
// ==========================================
const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getCategoryById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: `No category with id ${id}`
      });
    }

    await deleteCategory(id);

    res.json({
      success: true,
      message: 'Category deleted',
      data: {
        id: Number(id)
      }
    });
  } catch (err) {
    console.error('Delete category error:', err);

    res.status(409).json({
      success: false,
      message: 'Failed to delete category',
      error: 'Category may still be linked to existing equipment'
    });
  }
};

module.exports = {
  listCategories,
  addCategory,
  editCategory,
  removeCategory
};
