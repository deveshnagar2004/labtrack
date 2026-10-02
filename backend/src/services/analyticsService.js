const pool = require('../config/db');

const getDashboardSummary = async () => {
  const [[equipmentCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_equipment,
      SUM(status = 'AVAILABLE') AS available,
      SUM(status = 'BOOKED') AS booked,
      SUM(status = 'ISSUED') AS issued,
      SUM(status = 'MAINTENANCE') AS under_maintenance,
      SUM(status = 'DAMAGED') AS damaged,
      SUM(status = 'LOST') AS lost,
      SUM(status = 'RETIRED') AS retired
    FROM equipment
  `);

  const [[bookingCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_bookings,
      SUM(status = 'PENDING') AS pending,
      SUM(status = 'APPROVED') AS approved,
      SUM(status = 'COMPLETED') AS completed,
      SUM(status = 'REJECTED') AS rejected,
      SUM(status = 'CANCELLED') AS cancelled
    FROM bookings
  `);

  const [[userCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_users,
      SUM(is_active = 1) AS active_users,
      SUM(role = 'STUDENT') AS students,
      SUM(role = 'LAB_ASSISTANT') AS lab_assistants,
      SUM(role = 'ADMIN') AS admins
    FROM users
  `);

  const [[issueCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_issues,
      SUM(status = 'OPEN') AS open_issues,
      SUM(status = 'IN_PROGRESS') AS in_progress_issues,
      SUM(status = 'RESOLVED') AS resolved_issues
    FROM equipment_issues
  `);

  return {
    equipment: equipmentCounts,
    bookings: bookingCounts,
    users: userCounts,
    issues: issueCounts
  };
};

const getEquipmentUtilization = async () => {
  const [rows] = await pool.query(`
    SELECT
      e.id,
      e.name,
      e.serial_number,
      e.status,
      COUNT(t.id) AS times_issued,
      COALESCE(
        SUM(
          TIMESTAMPDIFF(
            MINUTE,
            t.issued_at,
            COALESCE(t.returned_at, NOW())
          )
        ),
        0
      ) AS total_minutes_used
    FROM equipment e
    LEFT JOIN equipment_transactions t
      ON e.id = t.equipment_id
    GROUP BY
      e.id,
      e.name,
      e.serial_number,
      e.status
    ORDER BY times_issued DESC
  `);

  return rows.map((row) => ({
    ...row,
    total_hours_used: Number(
      (row.total_minutes_used / 60).toFixed(2)
    )
  }));
};

const getMaintenanceStats = async () => {
  const [[statusCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_records,
      SUM(status = 'SCHEDULED') AS scheduled,
      SUM(status = 'IN_PROGRESS') AS in_progress,
      SUM(status = 'COMPLETED') AS completed,
      COALESCE(SUM(cost), 0) AS total_cost_spent
    FROM maintenance_records
  `);

  const [upcoming] = await pool.query(`
    SELECT
      m.id,
      m.equipment_id,
      e.name AS equipment_name,
      m.next_due_date
    FROM maintenance_records m
    JOIN equipment e
      ON m.equipment_id = e.id
    WHERE m.next_due_date IS NOT NULL
      AND m.next_due_date >= CURDATE()
    ORDER BY m.next_due_date ASC
    LIMIT 10
  `);

  return {
    summary: statusCounts,
    upcoming_due: upcoming
  };
};

const getBookingStats = async () => {
  const [dailyTrend] = await pool.query(`
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM bookings
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  const [byStatus] = await pool.query(`
    SELECT
      status,
      COUNT(*) AS count
    FROM bookings
    GROUP BY status
  `);

  return {
    daily_trend: dailyTrend,
    by_status: byStatus
  };
};

module.exports = {
  getDashboardSummary,
  getEquipmentUtilization,
  getMaintenanceStats,
  getBookingStats
};
