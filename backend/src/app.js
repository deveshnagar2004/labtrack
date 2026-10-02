const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const labRoutes = require('./routes/labRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const issueRoutes = require('./routes/issueRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LabTrack API is running',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

// Test DB connection route
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = ?`,
      [process.env.DB_NAME]
    );

    res.json({
      success: true,
      message: 'Database connected successfully',
      data: rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    });
  }
});
// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;
