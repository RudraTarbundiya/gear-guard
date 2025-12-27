-- ============================================
-- GearGuard Database Schema
-- Maintenance Management System
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS MAINTENANCE_REQUESTS;
DROP TABLE IF EXISTS EQUIPMENT;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS MAINTENANCE_TEAMS;

-- ============================================
-- Table: MAINTENANCE_TEAMS
-- Purpose: Organize technicians into teams
-- ============================================
CREATE TABLE MAINTENANCE_TEAMS (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_team_name (team_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: USERS
-- Purpose: Store user accounts and roles
-- ============================================
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'TECHNICIAN') NOT NULL,
    team_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: EQUIPMENT
-- Purpose: Track all equipment/assets
-- ============================================
CREATE TABLE EQUIPMENT (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    team_id INT NULL,
    status ENUM('ACTIVE', 'SCRAPPED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_serial_number (serial_number),
    INDEX idx_status (status),
    INDEX idx_team (team_id),
    FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: MAINTENANCE_REQUESTS
-- Purpose: Track maintenance workflow
-- ============================================
CREATE TABLE MAINTENANCE_REQUESTS (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(200) NOT NULL,
    equipment_id INT NOT NULL,
    team_id INT NULL,
    technician_id INT NULL,
    request_type ENUM('CORRECTIVE', 'PREVENTIVE') NOT NULL,
    status ENUM('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP') DEFAULT 'NEW',
    scheduled_date DATE NULL,
    duration_hours DECIMAL(10, 2) NULL,
    cost_estimation DECIMAL(10, 2) NULL,
    completion_notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_request_type (request_type),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_created_by (created_by),
    INDEX idx_team (team_id),
    INDEX idx_technician (technician_id),
    FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES USERS(user_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Sample Data (Seed)
-- ============================================

-- Insert Teams
INSERT INTO MAINTENANCE_TEAMS (team_name) VALUES
('Electrical Team'),
('Mechanical Team'),
('HVAC Team'),
('IT Support Team');

-- Insert Users (password: password123, hashed with bcrypt)
-- Note: Actual password hashing is done in the application
INSERT INTO USERS (name, email, password, role, team_id) VALUES
('Admin User', 'admin@gearguard.com', '$2a$10$hashedpassword', 'ADMIN', NULL),
('John Doe', 'user@gearguard.com', '$2a$10$hashedpassword', 'USER', NULL),
('Mike Technician', 'tech1@gearguard.com', '$2a$10$hashedpassword', 'TECHNICIAN', 1),
('Sarah Mechanic', 'tech2@gearguard.com', '$2a$10$hashedpassword', 'TECHNICIAN', 2),
('Tom HVAC Expert', 'tech3@gearguard.com', '$2a$10$hashedpassword', 'TECHNICIAN', 3),
('Alice IT Support', 'tech4@gearguard.com', '$2a$10$hashedpassword', 'TECHNICIAN', 4);

-- Insert Equipment
INSERT INTO EQUIPMENT (name, serial_number, location, department, team_id, status) VALUES
('Generator 5000W', 'GEN-001', 'Building A - Floor 1', 'Operations', 1, 'ACTIVE'),
('Air Compressor', 'AC-102', 'Workshop', 'Maintenance', 2, 'ACTIVE'),
('Hydraulic Press', 'HP-205', 'Factory Floor', 'Production', 2, 'ACTIVE'),
('HVAC Unit - Central', 'HVAC-301', 'Building B - Roof', 'Facilities', 3, 'ACTIVE'),
('Server Rack Dell R740', 'SRV-401', 'Data Center', 'IT', 4, 'ACTIVE'),
('Forklift Toyota', 'FLT-501', 'Warehouse', 'Logistics', 2, 'ACTIVE'),
('CNC Machine', 'CNC-601', 'Factory Floor', 'Production', 2, 'ACTIVE'),
('Backup Generator', 'GEN-002', 'Building A - Basement', 'Operations', 1, 'ACTIVE'),
('Cooling Tower', 'CT-701', 'Building C - Roof', 'Facilities', 3, 'ACTIVE'),
('UPS System', 'UPS-801', 'Data Center', 'IT', 4, 'ACTIVE');

-- Insert Sample Maintenance Requests
INSERT INTO MAINTENANCE_REQUESTS 
(subject, equipment_id, team_id, technician_id, request_type, status, scheduled_date, duration_hours, cost_estimation, completion_notes, created_by) 
VALUES
('Generator not starting', 1, 1, 3, 'CORRECTIVE', 'NEW', NULL, NULL, NULL, NULL, 2),
('Preventive maintenance - Air Compressor', 2, 2, 4, 'PREVENTIVE', 'IN_PROGRESS', '2024-12-30', NULL, NULL, NULL, 1),
('Hydraulic Press leaking oil', 3, 2, 4, 'CORRECTIVE', 'REPAIRED', '2024-12-25', 3.5, 450.00, 'Replaced seal and checked pressure levels', 2),
('HVAC Unit making noise', 4, 3, 5, 'CORRECTIVE', 'IN_PROGRESS', NULL, NULL, NULL, NULL, 2),
('Server Rack temperature alert', 5, 4, 6, 'CORRECTIVE', 'NEW', NULL, NULL, NULL, NULL, 2),
('Monthly forklift inspection', 6, 2, NULL, 'PREVENTIVE', 'NEW', '2025-01-05', NULL, NULL, NULL, 1),
('CNC Machine calibration needed', 7, 2, 4, 'PREVENTIVE', 'REPAIRED', '2024-12-20', 2.0, 200.00, 'Calibrated successfully', 1),
('Backup Generator test run', 8, 1, 3, 'PREVENTIVE', 'IN_PROGRESS', '2024-12-28', NULL, NULL, NULL, 1);

-- ============================================
-- Views (Optional - for reporting)
-- ============================================

-- View: Equipment with team info
CREATE OR REPLACE VIEW vw_equipment_details AS
SELECT 
    e.equipment_id,
    e.name,
    e.serial_number,
    e.location,
    e.department,
    e.status,
    mt.team_name,
    e.created_at
FROM EQUIPMENT e
LEFT JOIN MAINTENANCE_TEAMS mt ON e.team_id = mt.team_id;

-- View: Requests with full details
CREATE OR REPLACE VIEW vw_request_details AS
SELECT 
    mr.request_id,
    mr.subject,
    mr.request_type,
    mr.status,
    mr.scheduled_date,
    mr.duration_hours,
    mr.cost_estimation,
    e.name AS equipment_name,
    e.serial_number,
    e.location,
    mt.team_name,
    tech.name AS technician_name,
    creator.name AS created_by_name,
    mr.created_at,
    mr.updated_at
FROM MAINTENANCE_REQUESTS mr
JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
LEFT JOIN USERS tech ON mr.technician_id = tech.user_id
JOIN USERS creator ON mr.created_by = creator.user_id;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional composite indexes
CREATE INDEX idx_request_team_status ON MAINTENANCE_REQUESTS(team_id, status);
CREATE INDEX idx_request_created_date ON MAINTENANCE_REQUESTS(created_by, created_at);
CREATE INDEX idx_equipment_team_status ON EQUIPMENT(team_id, status);

-- ============================================
-- Stored Procedures (Optional)
-- ============================================

-- Procedure: Get team statistics
DELIMITER //
CREATE PROCEDURE sp_get_team_stats(IN p_team_id INT)
BEGIN
    SELECT 
        mt.team_name,
        COUNT(DISTINCT u.user_id) AS technician_count,
        COUNT(DISTINCT e.equipment_id) AS equipment_count,
        COUNT(DISTINCT mr.request_id) AS total_requests,
        SUM(CASE WHEN mr.status = 'NEW' THEN 1 ELSE 0 END) AS new_requests,
        SUM(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN mr.status = 'REPAIRED' THEN 1 ELSE 0 END) AS repaired,
        SUM(mr.cost_estimation) AS total_cost
    FROM MAINTENANCE_TEAMS mt
    LEFT JOIN USERS u ON mt.team_id = u.team_id AND u.role = 'TECHNICIAN'
    LEFT JOIN EQUIPMENT e ON mt.team_id = e.team_id
    LEFT JOIN MAINTENANCE_REQUESTS mr ON mt.team_id = mr.team_id
    WHERE mt.team_id = p_team_id
    GROUP BY mt.team_id, mt.team_name;
END //
DELIMITER ;

-- ============================================
-- End of Schema
-- ============================================
