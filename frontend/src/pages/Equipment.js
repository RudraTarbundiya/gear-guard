import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Equipment.css';

const Equipment = () => {
  const { isAdmin } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    location: '',
    department: '',
    team_id: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipRes, teamsRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/teams')
      ]);
      setEquipment(equipRes.data.data);
      setTeams(teamsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/equipment/${editingItem.equipment_id}`, formData);
        toast.success('Equipment updated successfully');
      } else {
        await api.post('/equipment', formData);
        toast.success('Equipment created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      serial_number: item.serial_number,
      location: item.location,
      department: item.department,
      team_id: item.team_id || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await api.delete(`/equipment/${id}`);
        toast.success('Equipment deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      serial_number: '',
      location: '',
      department: '',
      team_id: '',
      status: 'ACTIVE'
    });
    setEditingItem(null);
  };

  if (loading) return <div className="loading">Loading equipment...</div>;

  return (
    <div className="equipment-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>Equipment Management</h1>
            <p className="subtitle">Manage all equipment and assets</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Equipment
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Serial Number</th>
                <th>Location</th>
                <th>Department</th>
                <th>Team</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.equipment_id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.serial_number}</td>
                  <td>{item.location}</td>
                  <td>{item.department}</td>
                  <td>{item.team_name || 'Unassigned'}</td>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.equipment_id)} style={{marginLeft: '0.5rem'}}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Equipment' : 'Add Equipment'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Equipment Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Team</label>
                <select
                  className="form-control"
                  value={formData.team_id}
                  onChange={(e) => setFormData({...formData, team_id: e.target.value})}
                >
                  <option value="">No Team</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SCRAPPED">Scrapped</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
