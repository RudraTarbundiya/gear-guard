import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    duration_hours: '',
    cost_estimation: '',
    completion_notes: ''
  });

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/requests/${id}`);
      setRequest(response.data.data);
      setUpdateData({
        status: response.data.data.status,
        duration_hours: response.data.data.duration_hours || '',
        cost_estimation: response.data.data.cost_estimation || '',
        completion_notes: response.data.data.completion_notes || ''
      });
    } catch (error) {
      toast.error('Failed to load request');
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/requests/${id}`, updateData);
      toast.success('Request updated successfully');
      fetchRequest();
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const assignToSelf = async () => {
    try {
      await api.put(`/requests/${id}/assign`, { technician_id: user.user_id });
      toast.success('Request assigned to you');
      fetchRequest();
    } catch (error) {
      toast.error('Failed to assign request');
    }
  };

  if (loading) return <div className="loading">Loading request details...</div>;
  if (!request) return <div className="loading">Request not found</div>;

  const canEdit = isAdmin || isTechnician;

  return (
    <div className="equipment-page">
      <div className="container">
        <button className="btn btn-secondary mb-3" onClick={() => navigate('/requests')}>
          ← Back to Requests
        </button>

        <div className="grid grid-2">
          <div className="card">
            <h2 className="card-title">Request Information</h2>
            <div className="request-details">
              <div className="detail-row">
                <strong>Subject:</strong>
                <span>{request.subject}</span>
              </div>
              <div className="detail-row">
                <strong>Equipment:</strong>
                <span>{request.equipment_name} ({request.serial_number})</span>
              </div>
              <div className="detail-row">
                <strong>Location:</strong>
                <span>{request.location}</span>
              </div>
              <div className="detail-row">
                <strong>Type:</strong>
                <span className={`badge badge-${request.request_type.toLowerCase()}`}>
                  {request.request_type}
                </span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`badge badge-${request.status.toLowerCase().replace('_', '-')}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
              <div className="detail-row">
                <strong>Created By:</strong>
                <span>{request.created_by_name} ({request.created_by_email})</span>
              </div>
              <div className="detail-row">
                <strong>Created At:</strong>
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Assignment & Schedule</h2>
            <div className="request-details">
              <div className="detail-row">
                <strong>Team:</strong>
                <span>{request.team_name || 'Unassigned'}</span>
              </div>
              <div className="detail-row">
                <strong>Technician:</strong>
                <span>{request.technician_name || 'Unassigned'}</span>
              </div>
              {request.scheduled_date && (
                <div className="detail-row">
                  <strong>Scheduled Date:</strong>
                  <span>{new Date(request.scheduled_date).toLocaleDateString()}</span>
                </div>
              )}
              {request.duration_hours && (
                <div className="detail-row">
                  <strong>Duration:</strong>
                  <span>{request.duration_hours} hours</span>
                </div>
              )}
              {request.cost_estimation && (
                <div className="detail-row">
                  <strong>Cost Estimation:</strong>
                  <span>${request.cost_estimation}</span>
                </div>
              )}
              
              {isTechnician && !request.technician_id && (
                <button className="btn btn-primary mt-2" onClick={assignToSelf}>
                  Assign to Me
                </button>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="card mt-4">
            <h2 className="card-title">Update Request</h2>
            <form onSubmit={handleUpdate}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={updateData.status}
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  >
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REPAIRED">Repaired</option>
                    <option value="SCRAP">Scrap</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={updateData.duration_hours}
                    onChange={(e) => setUpdateData({...updateData, duration_hours: e.target.value})}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Estimation ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={updateData.cost_estimation}
                    onChange={(e) => setUpdateData({...updateData, cost_estimation: e.target.value})}
                    placeholder="e.g., 150.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Completion Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={updateData.completion_notes}
                  onChange={(e) => setUpdateData({...updateData, completion_notes: e.target.value})}
                  placeholder="Add notes about the work performed..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Update Request'}
              </button>
            </form>
          </div>
        )}

        {request.completion_notes && (
          <div className="card mt-4">
            <h2 className="card-title">Completion Notes</h2>
            <p>{request.completion_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
