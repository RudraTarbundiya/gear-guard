const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database schema and seed data
const initDatabase = async () => {
  let connection;

  try {
    // Connect to MySQL server (without selecting a database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('📦 Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop existing tables to start fresh
    await connection.query(`DROP TABLE IF EXISTS MAINTENANCE_REQUESTS`);
    await connection.query(`DROP TABLE IF EXISTS EQUIPMENT`);
    await connection.query(`DROP TABLE IF EXISTS USERS`);
    await connection.query(`DROP TABLE IF EXISTS MAINTENANCE_TEAMS`);

    // Create MAINTENANCE_TEAMS table
    await connection.query(`
      CREATE TABLE MAINTENANCE_TEAMS (
        team_id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created MAINTENANCE_TEAMS table');

    // Create USERS table
    await connection.query(`
      CREATE TABLE USERS (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'USER', 'TECHNICIAN') NOT NULL,
        team_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created USERS table');

    // Create EQUIPMENT table
    await connection.query(`
      CREATE TABLE EQUIPMENT (
        equipment_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        location VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        team_id INT NULL,
        status ENUM('ACTIVE', 'SCRAPPED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created EQUIPMENT table');

    // Create MAINTENANCE_REQUESTS table
    await connection.query(`
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
        FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES MAINTENANCE_TEAMS(team_id) ON DELETE SET NULL,
        FOREIGN KEY (technician_id) REFERENCES USERS(user_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created MAINTENANCE_REQUESTS table');

    // ====================
    // SEED DATA
    // ====================

    // Insert Maintenance Teams
    await connection.query(`
      INSERT INTO MAINTENANCE_TEAMS (team_name) VALUES
      ('Electrical Team'),
      ('Mechanical Team'),
      ('HVAC Team'),
      ('IT Support Team')
    `);
    console.log('✅ Seeded MAINTENANCE_TEAMS');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert Users
    await connection.query(`
      INSERT INTO USERS (name, email, password, role, team_id) VALUES
      ('Admin User', 'admin@gearguard.com', ?, 'ADMIN', NULL),
      ('John Doe', 'user@gearguard.com', ?, 'USER', NULL),
      ('Mike Technician', 'tech1@gearguard.com', ?, 'TECHNICIAN', 1),
      ('Sarah Mechanic', 'tech2@gearguard.com', ?, 'TECHNICIAN', 2),
      ('Tom HVAC Expert', 'tech3@gearguard.com', ?, 'TECHNICIAN', 3),
      ('Alice IT Support', 'tech4@gearguard.com', ?, 'TECHNICIAN', 4),
      ('Jane User', 'jane@gearguard.com', ?, 'USER', NULL)
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
    console.log('✅ Seeded USERS (password: password123)');

    // Insert Equipment
    await connection.query(`
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
      ('UPS System', 'UPS-801', 'Data Center', 'IT', 4, 'ACTIVE')
    `);
    console.log('✅ Seeded EQUIPMENT');

    // Insert Maintenance Requests
    await connection.query(`
      INSERT INTO MAINTENANCE_REQUESTS 
      (subject, equipment_id, team_id, technician_id, request_type, status, scheduled_date, duration_hours, cost_estimation, completion_notes, created_by) 
      VALUES
      ('Generator not starting', 1, 1, 3, 'CORRECTIVE', 'NEW', NULL, NULL, NULL, NULL, 2),
      ('Preventive maintenance - Air Compressor', 2, 2, 4, 'PREVENTIVE', 'IN_PROGRESS', '2024-12-30', NULL, NULL, NULL, 1),
      ('Hydraulic Press leaking oil', 3, 2, 4, 'CORRECTIVE', 'REPAIRED', '2024-12-25', 3.5, 450.00, 'Replaced seal and checked pressure levels', 2),
      ('HVAC Unit making noise', 4, 3, 5, 'CORRECTIVE', 'IN_PROGRESS', NULL, NULL, NULL, NULL, 7),
      ('Server Rack temperature alert', 5, 4, 6, 'CORRECTIVE', 'NEW', NULL, NULL, NULL, NULL, 2),
      ('Monthly forklift inspection', 6, 2, NULL, 'PREVENTIVE', 'NEW', '2025-01-05', NULL, NULL, NULL, 1),
      ('CNC Machine calibration needed', 7, 2, 4, 'PREVENTIVE', 'REPAIRED', '2024-12-20', 2.0, 200.00, 'Calibrated successfully', 1),
      ('Backup Generator test run', 8, 1, 3, 'PREVENTIVE', 'IN_PROGRESS', '2024-12-28', NULL, NULL, NULL, 1)
    `);
    console.log('✅ Seeded MAINTENANCE_REQUESTS');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('   Admin: admin@gearguard.com / password123');
    console.log('   User: user@gearguard.com / password123');
    console.log('   Technician: tech1@gearguard.com / password123');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();
