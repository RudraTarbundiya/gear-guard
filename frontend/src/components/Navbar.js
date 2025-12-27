import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <span className="logo-icon">⚙️</span>
          <span className="logo-text">GearGuard</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          
          {user.role === 'ADMIN' && (
            <>
              <Link to="/equipment" className="nav-link">Equipment</Link>
              <Link to="/teams" className="nav-link">Teams</Link>
            </>
          )}
          
          <Link to="/requests" className="nav-link">
            {user.role === 'USER' ? 'My Requests' : 'Requests'}
          </Link>
          
          {(user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
            <>
              <Link to="/kanban" className="nav-link">Kanban</Link>
              <Link to="/calendar" className="nav-link">Calendar</Link>
            </>
          )}
          
          <div className="nav-user">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
