import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Requests = () => {
  const { isUser, isAdmin, isTechnician } = useAuth();
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    equipment_id: '',
    request_type: 'CORRECTIVE',
    scheduled_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, equipmentRes] = await Promise.all([
        api.get('/requests'),
        api.get('/equipment')
      ]);
      setRequests(requestsRes.data.data);
      setEquipment(equipmentRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', formData);
      toast.success('Request created successfully');
      setShowModal(false);
      setFormData({
        subject: '',
        equipment_id: '',
        request_type: 'CORRECTIVE',
        scheduled_date: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="equipment-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>{isUser ? 'My Requests' : 'Maintenance Requests'}</h1>
            <p className="subtitle">View and manage maintenance requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Request
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Equipment</th>
                <th>Type</th>
                <th>Status</th>
                <th>Team</th>
                <th>Technician</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td><strong>{request.subject}</strong></td>
                  <td>{request.equipment_name}</td>
                  <td>
                    <span className={`badge badge-${request.request_type.toLowerCase()}`}>
                      {request.request_type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${request.status.toLowerCase().replace('_', '-')}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{request.team_name || 'Unassigned'}</td>
                  <td>{request.technician_name || 'Unassigned'}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/requests/${request.request_id}`} className="btn btn-sm btn-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Maintenance Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <select
                  className="form-control"
                  value={formData.equipment_id}
                  onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipment.filter(e => e.status === 'ACTIVE').map((item) => (
                    <option key={item.equipment_id} value={item.equipment_id}>
                      {item.name} - {item.serial_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Request Type</label>
                <select
                  className="form-control"
                  value={formData.request_type}
                  onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  required
                >
                  <option value="CORRECTIVE">Corrective (Fix Issue)</option>
                  <option value="PREVENTIVE">Preventive (Scheduled Maintenance)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
