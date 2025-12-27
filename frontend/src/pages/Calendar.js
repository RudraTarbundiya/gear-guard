import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './CalendarView.css';

const CalendarView = () => {
  const [value, setValue] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data.data.filter(r => r.scheduled_date));
    } catch (error) {
      toast.error('Failed to load scheduled maintenance');
    }
  };

  const handleDateChange = (date) => {
    setValue(date);
    const dateStr = date.toISOString().split('T')[0];
    const filtered = requests.filter(r => 
      r.scheduled_date && r.scheduled_date.startsWith(dateStr)
    );
    setSelectedDateRequests(filtered);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const dayRequests = requests.filter(r => 
        r.scheduled_date && r.scheduled_date.startsWith(dateStr)
      );
      if (dayRequests.length > 0) {
        return <div className="calendar-dot">{dayRequests.length}</div>;
      }
    }
    return null;
  };

  return (
    <div className="equipment-page">
      <div className="container">
        <div className="page-header">
          <h1>📅 Maintenance Calendar</h1>
          <p className="subtitle">View scheduled preventive maintenance</p>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <Calendar
              onChange={handleDateChange}
              value={value}
              tileContent={tileContent}
            />
          </div>

          <div className="card">
            <h3 className="card-title">
              Scheduled for {value.toLocaleDateString()}
            </h3>
            {selectedDateRequests.length > 0 ? (
              <div className="scheduled-list">
                {selectedDateRequests.map((request) => (
                  <div key={request.request_id} className="scheduled-item">
                    <div className="scheduled-header">
                      <strong>{request.subject}</strong>
                      <span className={`badge badge-${request.status.toLowerCase().replace('_', '-')}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="scheduled-details">
                      <div>Equipment: {request.equipment_name}</div>
                      <div>Team: {request.team_name || 'Unassigned'}</div>
                      {request.technician_name && (
                        <div>Technician: {request.technician_name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center mt-4">No maintenance scheduled for this date</p>
            )}
          </div>
        </div>

        <div className="card mt-4">
          <h3 className="card-title">All Upcoming Maintenance</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Equipment</th>
                  <th>Team</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                  .map((request) => (
                    <tr key={request.request_id}>
                      <td>{new Date(request.scheduled_date).toLocaleDateString()}</td>
                      <td><strong>{request.subject}</strong></td>
                      <td>{request.equipment_name}</td>
                      <td>{request.team_name || 'Unassigned'}</td>
                      <td>
                        <span className={`badge badge-${request.status.toLowerCase().replace('_', '-')}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
