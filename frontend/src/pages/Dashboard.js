import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isTechnician, isUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity')
      ]);
      setStats(statsRes.data.data);
      setActivity(activityRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.name}! 👋</h1>
            <p className="subtitle">Here's what's happening with your maintenance operations</p>
          </div>
        </div>

        {/* Admin Dashboard */}
        {isAdmin && (
          <>
            <div className="grid grid-4">
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#dbeafe' }}>⚙️</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total_equipment}</div>
                  <div className="stat-label">Active Equipment</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>📋</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.requests?.new_requests || 0}</div>
                  <div className="stat-label">New Requests</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#fecaca' }}>⚠️</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.overdue_requests || 0}</div>
                  <div className="stat-label">Overdue</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>💰</div>
                <div className="stat-content">
                  <div className="stat-value">${stats.total_cost?.toFixed(2) || '0.00'}</div>
                  <div className="stat-label">Total Cost</div>
                </div>
              </div>
            </div>

            <div className="grid grid-2 mt-4">
              <div className="card">
                <h3 className="card-title">Request Overview</h3>
                <div className="request-stats">
                  <div className="request-stat">
                    <span className="badge badge-new">{stats.requests?.new_requests || 0} New</span>
                  </div>
                  <div className="request-stat">
                    <span className="badge badge-in-progress">{stats.requests?.in_progress || 0} In Progress</span>
                  </div>
                  <div className="request-stat">
                    <span className="badge badge-repaired">{stats.requests?.repaired || 0} Repaired</span>
                  </div>
                  <div className="request-stat">
                    <span className="badge badge-scrap">{stats.requests?.scrap || 0} Scrap</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <Link to="/equipment" className="action-btn">
                    <span>⚙️</span>
                    <span>Manage Equipment</span>
                  </Link>
                  <Link to="/teams" className="action-btn">
                    <span>👥</span>
                    <span>Manage Teams</span>
                  </Link>
                  <Link to="/kanban" className="action-btn">
                    <span>📊</span>
                    <span>View Kanban</span>
                  </Link>
                  <Link to="/calendar" className="action-btn">
                    <span>📅</span>
                    <span>View Calendar</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Technician Dashboard */}
        {isTechnician && (
          <>
            <div className="grid grid-4">
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#dbeafe' }}>📋</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.team_requests?.total || 0}</div>
                  <div className="stat-label">Team Requests</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>🔧</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_tasks?.in_progress || 0}</div>
                  <div className="stat-label">My Active Tasks</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_tasks?.completed || 0}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#e0e7ff' }}>💰</div>
                <div className="stat-content">
                  <div className="stat-value">${stats.total_cost?.toFixed(2) || '0.00'}</div>
                  <div className="stat-label">Total Cost</div>
                </div>
              </div>
            </div>

            <div className="grid grid-2 mt-4">
              <div className="card">
                <h3 className="card-title">Team Performance</h3>
                <div className="request-stats">
                  <div className="request-stat">
                    <span className="badge badge-new">{stats.team_requests?.new_requests || 0} New</span>
                  </div>
                  <div className="request-stat">
                    <span className="badge badge-in-progress">{stats.team_requests?.in_progress || 0} In Progress</span>
                  </div>
                  <div className="request-stat">
                    <span className="badge badge-repaired">{stats.team_requests?.repaired || 0} Repaired</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <Link to="/kanban" className="action-btn">
                    <span>📊</span>
                    <span>View Kanban</span>
                  </Link>
                  <Link to="/requests" className="action-btn">
                    <span>📋</span>
                    <span>All Requests</span>
                  </Link>
                  <Link to="/calendar" className="action-btn">
                    <span>📅</span>
                    <span>View Calendar</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* User Dashboard */}
        {isUser && (
          <>
            <div className="grid grid-4">
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#dbeafe' }}>📋</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_requests?.total || 0}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_requests?.in_progress || 0}</div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_requests?.repaired || 0}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon" style={{ background: '#fee2e2' }}>📌</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.my_requests?.new_requests || 0}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <div className="flex-between mb-3">
                <h3 className="card-title">Need Help?</h3>
                <Link to="/requests/new" className="btn btn-primary">
                  Create New Request
                </Link>
              </div>
              <p className="text-muted">
                Submit a maintenance request for any equipment that needs attention. 
                Our team will review and assign a technician promptly.
              </p>
            </div>
          </>
        )}

        {/* Recent Activity (All Roles) */}
        <div className="card mt-4">
          <h3 className="card-title mb-3">Recent Activity</h3>
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map((item) => (
                <div key={item.request_id} className="activity-item">
                  <div className="activity-icon">
                    {item.status === 'NEW' && '📋'}
                    {item.status === 'IN_PROGRESS' && '🔧'}
                    {item.status === 'REPAIRED' && '✅'}
                    {item.status === 'SCRAP' && '🗑️'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{item.subject}</div>
                    <div className="activity-meta">
                      <span>{item.equipment_name}</span>
                      <span>•</span>
                      <span className={`badge badge-${item.status.toLowerCase().replace('_', '-')}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link to={`/requests/${item.request_id}`} className="activity-link">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
