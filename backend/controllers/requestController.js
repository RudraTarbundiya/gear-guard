const db = require('../config/database');

// @desc    Get all maintenance requests (role-based)
// @route   GET /api/requests
// @access  Private
exports.getAllRequests = async (req, res) => {
  try {
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        mt.team_name,
        u.name as technician_name,
        creator.name as created_by_name
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
      LEFT JOIN USERS u ON mr.technician_id = u.user_id
      JOIN USERS creator ON mr.created_by = creator.user_id
    `;
    let params = [];

    // USER: see only their own requests
    if (req.user.role === 'USER') {
      query += ' WHERE mr.created_by = ?';
      params.push(req.user.user_id);
    }
    // TECHNICIAN: see only their team's requests
    else if (req.user.role === 'TECHNICIAN' && req.user.team_id) {
      query += ' WHERE mr.team_id = ?';
      params.push(req.user.team_id);
    }
    // ADMIN: see all requests (no filter)

    query += ' ORDER BY mr.created_at DESC';

    const [requests] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance requests',
      error: error.message
    });
  }
};

// @desc    Get single maintenance request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        e.location,
        mt.team_name,
        u.name as technician_name,
        creator.name as created_by_name,
        creator.email as created_by_email
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
      LEFT JOIN USERS u ON mr.technician_id = u.user_id
      JOIN USERS creator ON mr.created_by = creator.user_id
      WHERE mr.request_id = ?`,
      [req.params.id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Check access rights
    const request = requests[0];
    if (req.user.role === 'USER' && request.created_by !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance request',
      error: error.message
    });
  }
};

// @desc    Create maintenance request
// @route   POST /api/requests
// @access  Private (All authenticated users)
exports.createRequest = async (req, res) => {
  try {
    const { subject, equipment_id, request_type, scheduled_date } = req.body;

    // Validation
    if (!subject || !equipment_id || !request_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, equipment_id, and request_type'
      });
    }

    // Get equipment to auto-assign team
    const [equipment] = await db.query(
      'SELECT team_id FROM EQUIPMENT WHERE equipment_id = ?',
      [equipment_id]
    );

    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const team_id = equipment[0].team_id;

    const [result] = await db.query(
      `INSERT INTO MAINTENANCE_REQUESTS 
       (subject, equipment_id, team_id, request_type, scheduled_date, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'NEW')`,
      [subject, equipment_id, team_id, request_type, scheduled_date || null, req.user.user_id]
    );

    // Fetch created request
    const [newRequest] = await db.query(
      `SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        mt.team_name,
        creator.name as created_by_name
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
      JOIN USERS creator ON mr.created_by = creator.user_id
      WHERE mr.request_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: newRequest[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance request',
      error: error.message
    });
  }
};

// @desc    Update maintenance request
// @route   PUT /api/requests/:id
// @access  Private (Admin & Technician)
exports.updateRequest = async (req, res) => {
  try {
    const {
      subject,
      status,
      technician_id,
      scheduled_date,
      duration_hours,
      cost_estimation,
      completion_notes
    } = req.body;

    // Check if request exists
    const [existing] = await db.query(
      'SELECT * FROM MAINTENANCE_REQUESTS WHERE request_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    const currentRequest = existing[0];

    // TECHNICIAN can only update their team's requests
    if (req.user.role === 'TECHNICIAN') {
      if (currentRequest.team_id !== req.user.team_id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this request'
        });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    let updateValues = [];

    if (subject !== undefined) {
      updateFields.push('subject = ?');
      updateValues.push(subject);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (technician_id !== undefined) {
      updateFields.push('technician_id = ?');
      updateValues.push(technician_id);
    }
    if (scheduled_date !== undefined) {
      updateFields.push('scheduled_date = ?');
      updateValues.push(scheduled_date);
    }
    if (duration_hours !== undefined) {
      updateFields.push('duration_hours = ?');
      updateValues.push(duration_hours);
    }
    if (cost_estimation !== undefined) {
      updateFields.push('cost_estimation = ?');
      updateValues.push(cost_estimation);
    }
    if (completion_notes !== undefined) {
      updateFields.push('completion_notes = ?');
      updateValues.push(completion_notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(req.params.id);

    await db.query(
      `UPDATE MAINTENANCE_REQUESTS SET ${updateFields.join(', ')} WHERE request_id = ?`,
      updateValues
    );

    // Fetch updated request
    const [updated] = await db.query(
      `SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        mt.team_name,
        u.name as technician_name,
        creator.name as created_by_name
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
      LEFT JOIN USERS u ON mr.technician_id = u.user_id
      JOIN USERS creator ON mr.created_by = creator.user_id
      WHERE mr.request_id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance request',
      error: error.message
    });
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/requests/:id
// @access  Private (Admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM MAINTENANCE_REQUESTS WHERE request_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    await db.query('DELETE FROM MAINTENANCE_REQUESTS WHERE request_id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance request',
      error: error.message
    });
  }
};

// @desc    Assign technician to request
// @route   PUT /api/requests/:id/assign
// @access  Private (Technician & Admin)
exports.assignTechnician = async (req, res) => {
  try {
    const { technician_id } = req.body;

    // If technician is assigning themselves
    if (req.user.role === 'TECHNICIAN') {
      // Get request details
      const [request] = await db.query(
        'SELECT team_id FROM MAINTENANCE_REQUESTS WHERE request_id = ?',
        [req.params.id]
      );

      if (request.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      if (request[0].team_id !== req.user.team_id) {
        return res.status(403).json({
          success: false,
          message: 'Can only assign requests from your team'
        });
      }

      // Assign to self
      await db.query(
        'UPDATE MAINTENANCE_REQUESTS SET technician_id = ?, status = ? WHERE request_id = ?',
        [req.user.user_id, 'IN_PROGRESS', req.params.id]
      );
    } else {
      // Admin can assign to anyone
      await db.query(
        'UPDATE MAINTENANCE_REQUESTS SET technician_id = ? WHERE request_id = ?',
        [technician_id, req.params.id]
      );
    }

    // Fetch updated request
    const [updated] = await db.query(
      `SELECT 
        mr.*,
        e.name as equipment_name,
        mt.team_name,
        u.name as technician_name
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN MAINTENANCE_TEAMS mt ON mr.team_id = mt.team_id
      LEFT JOIN USERS u ON mr.technician_id = u.user_id
      WHERE mr.request_id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning technician',
      error: error.message
    });
  }
};
