const db = require('../config/database');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getAllTeams = async (req, res) => {
  try {
    const [teams] = await db.query(
      `SELECT 
        mt.*,
        COUNT(DISTINCT u.user_id) as technician_count,
        COUNT(DISTINCT e.equipment_id) as equipment_count
       FROM MAINTENANCE_TEAMS mt
       LEFT JOIN USERS u ON mt.team_id = u.team_id AND u.role = 'TECHNICIAN'
       LEFT JOIN EQUIPMENT e ON mt.team_id = e.team_id
       GROUP BY mt.team_id
       ORDER BY mt.team_name`
    );

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

// @desc    Get single team with details
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res) => {
  try {
    const [teams] = await db.query(
      'SELECT * FROM MAINTENANCE_TEAMS WHERE team_id = ?',
      [req.params.id]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team members
    const [members] = await db.query(
      'SELECT user_id, name, email FROM USERS WHERE team_id = ? AND role = "TECHNICIAN"',
      [req.params.id]
    );

    // Get team equipment
    const [equipment] = await db.query(
      'SELECT equipment_id, name, serial_number, status FROM EQUIPMENT WHERE team_id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...teams[0],
        members,
        equipment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message
    });
  }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Admin only)
exports.createTeam = async (req, res) => {
  try {
    const { team_name } = req.body;

    if (!team_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide team name'
      });
    }

    const [result] = await db.query(
      'INSERT INTO MAINTENANCE_TEAMS (team_name) VALUES (?)',
      [team_name]
    );

    const [newTeam] = await db.query(
      'SELECT * FROM MAINTENANCE_TEAMS WHERE team_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: newTeam[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin only)
exports.updateTeam = async (req, res) => {
  try {
    const { team_name } = req.body;

    await db.query(
      'UPDATE MAINTENANCE_TEAMS SET team_name = ? WHERE team_id = ?',
      [team_name, req.params.id]
    );

    const [updated] = await db.query(
      'SELECT * FROM MAINTENANCE_TEAMS WHERE team_id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin only)
exports.deleteTeam = async (req, res) => {
  try {
    await db.query('DELETE FROM MAINTENANCE_TEAMS WHERE team_id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
};
