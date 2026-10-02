const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const {
  findUserByEmail,
  createUser,
  findUserById
} = require('../models/userModel');

const { isValidEmail } = require('../utils/validation');

const SALT_ROUNDS = 10;

// ==========================================
// REGISTER
// ==========================================
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'name, email, and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Weak password',
        error: 'Password must be at least 6 characters'
      });
    }

    // Public registration can only create STUDENT accounts
    const finalRole = 'STUDENT';

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Registration failed',
        error: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await createUser({
      name,
      email,
      passwordHash,
      role: finalRole,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: userId,
        name,
        email,
        role: finalRole
      }
    });

  } catch (err) {
    console.error('Registration error:', err);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
};


// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'email and password are required'
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        error: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Login failed',
        error: 'This account has been deactivated'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        error: 'Invalid email or password'
      });
    }

    const token = generateToken({
      id: user.id,
      role: user.role
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};


// ==========================================
// GET CURRENT USER
// ==========================================
const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'The authenticated user no longer exists'
      });
    }

    return res.json({
      success: true,
      message: 'User fetched successfully',
      data: user
    });

  } catch (err) {
    console.error('Get user error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: err.message
    });
  }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
  register,
  login,
  getMe
};