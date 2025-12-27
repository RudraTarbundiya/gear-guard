const db = require('../config/database');

// @desc    Get dashboard stats (role-based)
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'ADMIN') {
      // Total equipment
      const [equipmentCount] = await db.query(
        'SELECT COUNT(*) as total FROM EQUIPMENT WHERE status = "ACTIVE"'
      );
      stats.total_equipment = equipmentCount[0].total;

      // Total requests by status
      const [requestStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) as new_requests,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'REPAIRED' THEN 1 ELSE 0 END) as repaired,
          SUM(CASE WHEN status = 'SCRAP' THEN 1 ELSE 0 END) as scrap
        FROM MAINTENANCE_REQUESTS
      `);
      stats.requests = requestStats[0];

      // Total teams
      const [teamCount] = await db.query('SELECT COUNT(*) as total FROM MAINTENANCE_TEAMS');
      stats.total_teams = teamCount[0].total;

      // Total cost
      const [costStats] = await db.query(
        'SELECT SUM(cost_estimation) as total_cost FROM MAINTENANCE_REQUESTS WHERE cost_estimation IS NOT NULL'
      );
      stats.total_cost = costStats[0].total_cost || 0;

      // Overdue requests (scheduled_date in past and not completed)
      const [overdue] = await db.query(`
        SELECT COUNT(*) as total 
        FROM MAINTENANCE_REQUESTS 
        WHERE scheduled_date < CURDATE() 
        AND status NOT IN ('REPAIRED', 'SCRAP')
      `);
      stats.overdue_requests = overdue[0].total;

    } else if (req.user.role === 'TECHNICIAN') {
      // My team's requests
      const [teamRequests] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) as new_requests,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'REPAIRED' THEN 1 ELSE 0 END) as repaired
        FROM MAINTENANCE_REQUESTS
        WHERE team_id = ?
      `, [req.user.team_id]);
      stats.team_requests = teamRequests[0];

      // My assigned tasks
      const [myTasks] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'REPAIRED' THEN 1 ELSE 0 END) as completed
        FROM MAINTENANCE_REQUESTS
        WHERE technician_id = ?
      `, [req.user.user_id]);
      stats.my_tasks = myTasks[0];

      // Total cost saved/spent
      const [costStats] = await db.query(
        'SELECT SUM(cost_estimation) as total_cost FROM MAINTENANCE_REQUESTS WHERE technician_id = ?',
        [req.user.user_id]
      );
      stats.total_cost = costStats[0].total_cost || 0;

    } else if (req.user.role === 'USER') {
      // My requests
      const [myRequests] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) as new_requests,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'REPAIRED' THEN 1 ELSE 0 END) as repaired,
          SUM(CASE WHEN status = 'SCRAP' THEN 1 ELSE 0 END) as scrap
        FROM MAINTENANCE_REQUESTS
        WHERE created_by = ?
      `, [req.user.user_id]);
      stats.my_requests = myRequests[0];
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    let query = `
      SELECT 
        mr.request_id,
        mr.subject,
        mr.status,
        mr.created_at,
        mr.updated_at,
        e.name as equipment_name,
        u.name as technician_name,
        creator.name as created_by_name
      FROM MAINTENANCE_REQUESTS mr
      JOIN EQUIPMENT e ON mr.equipment_id = e.equipment_id
      LEFT JOIN USERS u ON mr.technician_id = u.user_id
      JOIN USERS creator ON mr.created_by = creator.user_id
    `;
    let params = [];

    if (req.user.role === 'USER') {
      query += ' WHERE mr.created_by = ?';
      params.push(req.user.user_id);
    } else if (req.user.role === 'TECHNICIAN') {
      query += ' WHERE mr.team_id = ?';
      params.push(req.user.team_id);
    }

    query += ' ORDER BY mr.updated_at DESC LIMIT 10';

    const [activity] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};
