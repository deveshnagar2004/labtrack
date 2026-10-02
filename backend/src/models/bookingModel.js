const pool = require('../config/db');

// GET ALL BOOKINGS
const getAllBookings = async (filters = {}) => {
  let query = `
    SELECT
      b.*,
      e.name AS equipment_name,
      e.serial_number,
      u.name AS user_name,
      u.email AS user_email
    FROM bookings b
    JOIN equipment e
      ON b.equipment_id = e.id
    JOIN users u
      ON b.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.status) {
    query += ' AND b.status = ?';
    params.push(filters.status);
  }

  if (filters.equipment_id) {
    query += ' AND b.equipment_id = ?';
    params.push(filters.equipment_id);
  }

  query += ' ORDER BY b.created_at DESC';

  const [rows] = await pool.query(query, params);

  return rows;
};

// GET BOOKINGS OF ONE USER
const getBookingsByUser = async (user_id) => {
  const [rows] = await pool.query(
    `
    SELECT
      b.*,
      e.name AS equipment_name,
      e.serial_number
    FROM bookings b
    JOIN equipment e
      ON b.equipment_id = e.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    `,
    [user_id]
  );

  return rows;
};

// GET BOOKING BY ID
const getBookingById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      b.*,
      e.name AS equipment_name,
      e.status AS equipment_status,
      u.name AS user_name
    FROM bookings b
    JOIN equipment e
      ON b.equipment_id = e.id
    JOIN users u
      ON b.user_id = u.id
    WHERE b.id = ?
    `,
    [id]
  );

  return rows[0];
};

// FIND EQUIPMENT BOOKING CONFLICTS
const findConflictingBookings = async (
  equipment_id,
  start_time,
  end_time,
  excludeBookingId = null
) => {
  let query = `
    SELECT id
    FROM bookings
    WHERE equipment_id = ?
      AND status IN ('PENDING', 'APPROVED')
      AND start_time < ?
      AND end_time > ?
  `;

  const params = [
    equipment_id,
    end_time,
    start_time
  ];

  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }

  const [rows] = await pool.query(query, params);

  return rows;
};

// FIND USER TIME CONFLICTS
const findUserTimeConflicts = async (
  user_id,
  start_time,
  end_time
) => {
  const [rows] = await pool.query(
    `
    SELECT id
    FROM bookings
    WHERE user_id = ?
      AND status IN ('PENDING', 'APPROVED')
      AND start_time < ?
      AND end_time > ?
    `,
    [
      user_id,
      end_time,
      start_time
    ]
  );

  return rows;
};

// CREATE BOOKING
const createBooking = async ({
  equipment_id,
  user_id,
  start_time,
  end_time,
  purpose
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO bookings
      (
        equipment_id,
        user_id,
        start_time,
        end_time,
        purpose
      )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      equipment_id,
      user_id,
      start_time,
      end_time,
      purpose || null
    ]
  );

  return result.insertId;
};

// UPDATE BOOKING STATUS
const updateBookingStatus = async (
  id,
  status,
  approved_by = null
) => {
  await pool.query(
    `
    UPDATE bookings
    SET status = ?,
        approved_by = ?
    WHERE id = ?
    `,
    [
      status,
      approved_by,
      id
    ]
  );
};

module.exports = {
  getAllBookings,
  getBookingsByUser,
  getBookingById,
  findConflictingBookings,
  findUserTimeConflicts,
  createBooking,
  updateBookingStatus
};