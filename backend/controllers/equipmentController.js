const db = require('../config/database');

// @desc    Get all equipment (Admin) or team's equipment (Others)
// @route   GET /api/equipment
// @access  Private
exports.getAllEquipment = async (req, res) => {
  try {
    let query = `
      SELECT e.*, mt.team_name 
      FROM EQUIPMENT e
      LEFT JOIN MAINTENANCE_TEAMS mt ON e.team_id = mt.team_id
    `;
    let params = [];

    // If technician, show only their team's equipment
    if (req.user.role === 'TECHNICIAN' && req.user.team_id) {
      query += ' WHERE e.team_id = ?';
      params.push(req.user.team_id);
    }

    query += ' ORDER BY e.created_at DESC';

    const [equipment] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipment = async (req, res) => {
  try {
    const [equipment] = await db.query(
      `SELECT e.*, mt.team_name 
       FROM EQUIPMENT e
       LEFT JOIN MAINTENANCE_TEAMS mt ON e.team_id = mt.team_id
       WHERE e.equipment_id = ?`,
      [req.params.id]
    );

    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: equipment[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Admin only)
exports.createEquipment = async (req, res) => {
  try {
    const { name, serial_number, location, department, team_id, status } = req.body;

    // Validation
    if (!name || !serial_number || !location || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if serial number already exists
    const [existing] = await db.query(
      'SELECT * FROM EQUIPMENT WHERE serial_number = ?',
      [serial_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }

    const [result] = await db.query(
      `INSERT INTO EQUIPMENT (name, serial_number, location, department, team_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, serial_number, location, department, team_id || null, status || 'ACTIVE']
    );

    // Fetch created equipment
    const [newEquipment] = await db.query(
      `SELECT e.*, mt.team_name 
       FROM EQUIPMENT e
       LEFT JOIN MAINTENANCE_TEAMS mt ON e.team_id = mt.team_id
       WHERE e.equipment_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: newEquipment[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating equipment',
      error: error.message
    });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin only)
exports.updateEquipment = async (req, res) => {
  try {
    const { name, serial_number, location, department, team_id, status } = req.body;

    // Check if equipment exists
    const [existing] = await db.query(
      'SELECT * FROM EQUIPMENT WHERE equipment_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    await db.query(
      `UPDATE EQUIPMENT 
       SET name = ?, serial_number = ?, location = ?, department = ?, team_id = ?, status = ?
       WHERE equipment_id = ?`,
      [name, serial_number, location, department, team_id || null, status, req.params.id]
    );

    // Fetch updated equipment
    const [updated] = await db.query(
      `SELECT e.*, mt.team_name 
       FROM EQUIPMENT e
       LEFT JOIN MAINTENANCE_TEAMS mt ON e.team_id = mt.team_id
       WHERE e.equipment_id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating equipment',
      error: error.message
    });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM EQUIPMENT WHERE equipment_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    await db.query('DELETE FROM EQUIPMENT WHERE equipment_id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting equipment',
      error: error.message
    });
  }
};
