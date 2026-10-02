const {
  getAllUsers,
  findUserById,
  updateUserRoleAndStatus,
  deactivateUser
} = require('../models/userModel');
const { isValidRole } = require('../utils/validation');

const listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await getAllUsers({ role, search });
    res.json({ success: true, message: 'Users fetched', data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: `No user with id ${req.params.id}` });
    }
    res.json({ success: true, message: 'User fetched', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: err.message });
  }
};

// Admin uses this to promote/demote a user (e.g. STUDENT -> LAB_ASSISTANT)
// and to reactivate a previously deactivated account.
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await findUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found', error: `No user with id ${id}` });
    }

    const role = req.body.role || existing.role;
    const is_active = req.body.is_active !== undefined ? req.body.is_active : existing.is_active;

    if (!isValidRole(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role', error: 'role must be STUDENT, LAB_ASSISTANT, or ADMIN' });
    }

    // Safety check: an admin should not be able to accidentally demote/deactivate themselves
    // and lock everyone out of admin actions.
    if (Number(id) === req.user.id && (role !== 'ADMIN' || !is_active)) {
      return res.status(400).json({
        success: false,
        message: 'Action not allowed',
        error: 'You cannot change your own role or deactivate your own account'
      });
    }

    await updateUserRoleAndStatus(id, { role, is_active });
    const updated = await findUserById(id);
    res.json({ success: true, message: 'User updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

// "Delete" is a soft delete (deactivate) — hard-deleting would cascade-delete
// the user's bookings/transactions/issues history, which we want to preserve.
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Action not allowed', error: 'You cannot deactivate your own account' });
    }

    const existing = await findUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found', error: `No user with id ${id}` });
    }

    await deactivateUser(id);
    res.json({ success: true, message: 'User deactivated', data: { id: Number(id), is_active: false } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to deactivate user', error: err.message });
  }
};

module.exports = { listUsers, getUser, editUser, removeUser };
