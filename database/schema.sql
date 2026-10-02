CREATE DATABASE IF NOT EXISTS labtrack_db;
USE labtrack_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT','LAB_ASSISTANT','ADMIN') NOT NULL DEFAULT 'STUDENT',
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE laboratories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(150),
  description TEXT,
  lab_assistant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_assistant_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE equipment_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lab_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  model_number VARCHAR(100),
  manufacturer VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  `condition` ENUM('EXCELLENT','GOOD','FAIR','POOR') DEFAULT 'GOOD',
  status ENUM('AVAILABLE','BOOKED','ISSUED','MAINTENANCE','DAMAGED','LOST','RETIRED') DEFAULT 'AVAILABLE',
  qr_code VARCHAR(255) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES laboratories(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE RESTRICT,
  INDEX idx_equipment_status (status),
  INDEX idx_equipment_lab (lab_id)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  purpose VARCHAR(255),
  status ENUM('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED') DEFAULT 'PENDING',
  approved_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  CHECK (end_time > start_time),
  INDEX idx_bookings_equipment (equipment_id),
  INDEX idx_bookings_user (user_id)
);

CREATE TABLE equipment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_id INT NULL,
  issued_at DATETIME,
  returned_at DATETIME NULL,
  issue_condition VARCHAR(50),
  return_condition VARCHAR(50),
  remarks TEXT,
  issued_by INT,
  returned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (returned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE equipment_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  reported_by INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_PROGRESS','RESOLVED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  technician_name VARCHAR(100),
  maintenance_type VARCHAR(100),
  description TEXT,
  cost DECIMAL(10,2),
  start_date DATE,
  completion_date DATE NULL,
  next_due_date DATE NULL,
  status ENUM('SCHEDULED','IN_PROGRESS','COMPLETED') DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  INDEX idx_maintenance_due (next_due_date)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);