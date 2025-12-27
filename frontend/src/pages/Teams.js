import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ team_name: '' });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', formData);
      toast.success('Team created successfully');
      setShowModal(false);
      setFormData({ team_name: '' });
      fetchTeams();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="equipment-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>Maintenance Teams</h1>
            <p className="subtitle">Manage teams and technicians</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Team
          </button>
        </div>

        <div className="grid grid-3">
          {teams.map((team) => (
            <div key={team.team_id} className="card">
              <h3 className="card-title">{team.team_name}</h3>
              <div className="team-stats">
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span>{team.technician_count} Technicians</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⚙️</span>
                  <span>{team.equipment_count} Equipment</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Team</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ team_name: e.target.value })}
                  required
                  placeholder="e.g., Electrical Team"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
