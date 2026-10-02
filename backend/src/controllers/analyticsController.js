const {
  getDashboardSummary,
  getEquipmentUtilization,
  getMaintenanceStats,
  getBookingStats
} = require('../services/analyticsService');

// Dashboard summary
const dashboardSummary = async (req, res) => {
  try {
    const data = await getDashboardSummary();

    res.json({
      success: true,
      message: 'Dashboard summary fetched',
      data
    });
  } catch (err) {
    console.error('Dashboard analytics error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: err.message
    });
  }
};

// Equipment utilization
const equipmentUtilization = async (req, res) => {
  try {
    const data = await getEquipmentUtilization();

    res.json({
      success: true,
      message: 'Equipment utilization fetched',
      data
    });
  } catch (err) {
    console.error('Equipment utilization analytics error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment utilization',
      error: err.message
    });
  }
};

// Maintenance statistics
const maintenanceStats = async (req, res) => {
  try {
    const data = await getMaintenanceStats();

    res.json({
      success: true,
      message: 'Maintenance stats fetched',
      data
    });
  } catch (err) {
    console.error('Maintenance analytics error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance stats',
      error: err.message
    });
  }
};

// Booking statistics
const bookingStats = async (req, res) => {
  try {
    const data = await getBookingStats();

    res.json({
      success: true,
      message: 'Booking stats fetched',
      data
    });
  } catch (err) {
    console.error('Booking analytics error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking stats',
      error: err.message
    });
  }
};

module.exports = {
  dashboardSummary,
  equipmentUtilization,
  maintenanceStats,
  bookingStats
};
