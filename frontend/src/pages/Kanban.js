import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Kanban.css';

const STATUS_COLUMNS = {
  NEW: { title: 'New', color: '#3b82f6' },
  IN_PROGRESS: { title: 'In Progress', color: '#f59e0b' },
  REPAIRED: { title: 'Repaired', color: '#10b981' },
  SCRAP: { title: 'Scrap', color: '#ef4444' }
};

const Kanban = () => {
  const { user, isTechnician } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const requestId = draggableId.replace('request-', '');
    const newStatus = destination.droppableId;

    try {
      await api.put(`/requests/${requestId}`, { status: newStatus });
      
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.request_id.toString() === requestId
            ? { ...req, status: newStatus }
            : req
        )
      );
      
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const assignToSelf = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/assign`, {
        technician_id: user.user_id
      });
      toast.success('Task assigned to you');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  const groupedRequests = Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
    acc[status] = requests.filter(req => req.status === status);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading kanban board...</div>;

  return (
    <div className="kanban-page">
      <div className="container-fluid">
        <div className="page-header">
          <div>
            <h1>📊 Kanban Board</h1>
            <p className="subtitle">Drag and drop to update request status</p>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {Object.entries(STATUS_COLUMNS).map(([status, config]) => (
              <div key={status} className="kanban-column">
                <div className="column-header" style={{ borderTopColor: config.color }}>
                  <h3>{config.title}</h3>
                  <span className="column-count">{groupedRequests[status]?.length || 0}</span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {groupedRequests[status]?.map((request, index) => (
                        <Draggable
                          key={request.request_id}
                          draggableId={`request-${request.request_id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                              onClick={() => setSelectedCard(request)}
                            >
                              <div className="card-header">
                                <h4>{request.subject}</h4>
                                <span className={`request-type-badge ${request.request_type.toLowerCase()}`}>
                                  {request.request_type === 'PREVENTIVE' ? '🔄' : '⚠️'}
                                </span>
                              </div>
                              
                              <div className="card-body">
                                <div className="card-detail">
                                  <span className="detail-label">Equipment:</span>
                                  <span className="detail-value">{request.equipment_name}</span>
                                </div>
                                
                                {request.team_name && (
                                  <div className="card-detail">
                                    <span className="detail-label">Team:</span>
                                    <span className="detail-value">{request.team_name}</span>
                                  </div>
                                )}
                                
                                {request.technician_name ? (
                                  <div className="card-detail">
                                    <span className="detail-label">Technician:</span>
                                    <span className="detail-value">👤 {request.technician_name}</span>
                                  </div>
                                ) : isTechnician && (
                                  <button
                                    className="btn btn-sm btn-primary assign-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      assignToSelf(request.request_id);
                                    }}
                                  >
                                    Assign to Me
                                  </button>
                                )}
                                
                                {request.scheduled_date && (
                                  <div className="card-detail">
                                    <span className="detail-label">Scheduled:</span>
                                    <span className="detail-value">📅 {new Date(request.scheduled_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {selectedCard && (
          <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Details</h2>
                <button className="modal-close" onClick={() => setSelectedCard(null)}>×</button>
              </div>
              <div className="request-details">
                <div className="detail-row">
                  <strong>Subject:</strong>
                  <span>{selectedCard.subject}</span>
                </div>
                <div className="detail-row">
                  <strong>Equipment:</strong>
                  <span>{selectedCard.equipment_name} ({selectedCard.serial_number})</span>
                </div>
                <div className="detail-row">
                  <strong>Type:</strong>
                  <span className={`badge badge-${selectedCard.request_type.toLowerCase()}`}>
                    {selectedCard.request_type}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`badge badge-${selectedCard.status.toLowerCase().replace('_', '-')}`}>
                    {selectedCard.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Team:</strong>
                  <span>{selectedCard.team_name || 'Unassigned'}</span>
                </div>
                <div className="detail-row">
                  <strong>Technician:</strong>
                  <span>{selectedCard.technician_name || 'Unassigned'}</span>
                </div>
                {selectedCard.scheduled_date && (
                  <div className="detail-row">
                    <strong>Scheduled Date:</strong>
                    <span>{new Date(selectedCard.scheduled_date).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedCard.duration_hours && (
                  <div className="detail-row">
                    <strong>Duration:</strong>
                    <span>{selectedCard.duration_hours} hours</span>
                  </div>
                )}
                {selectedCard.cost_estimation && (
                  <div className="detail-row">
                    <strong>Cost:</strong>
                    <span>${selectedCard.cost_estimation}</span>
                  </div>
                )}
                {selectedCard.completion_notes && (
                  <div className="detail-row">
                    <strong>Notes:</strong>
                    <span>{selectedCard.completion_notes}</span>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Created:</strong>
                  <span>{new Date(selectedCard.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;
