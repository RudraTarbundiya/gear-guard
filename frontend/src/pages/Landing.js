import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Zero Downtime <br />
                <span className="gradient-text">Starts Here</span>
              </h1>
              <p className="hero-subtitle">
                Streamline equipment maintenance, reduce costs, and maximize uptime with 
                GearGuard's intelligent maintenance management platform.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Login
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="floating-card card-1">
                <span className="icon">⚙️</span>
                <span>Equipment Tracking</span>
              </div>
              <div className="floating-card card-2">
                <span className="icon">📊</span>
                <span>Real-time Analytics</span>
              </div>
              <div className="floating-card card-3">
                <span className="icon">🔧</span>
                <span>Smart Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="problem-solution">
        <div className="container">
          <div className="section-header text-center">
            <h2>The Challenge</h2>
            <p>Traditional maintenance management is broken</p>
          </div>
          
          <div className="grid grid-3">
            <div className="card fade-in">
              <div className="problem-icon">❌</div>
              <h3>Manual Tracking</h3>
              <p>Spreadsheets and paper logs lead to lost data and missed maintenance</p>
            </div>
            <div className="card fade-in">
              <div className="problem-icon">⏱️</div>
              <h3>Reactive Repairs</h3>
              <p>Equipment failures cause unexpected downtime and high repair costs</p>
            </div>
            <div className="card fade-in">
              <div className="problem-icon">📉</div>
              <h3>Poor Visibility</h3>
              <p>Lack of insights into equipment health and maintenance performance</p>
            </div>
          </div>

          <div className="section-header text-center mt-4">
            <h2>Our Solution</h2>
            <p>A comprehensive platform that transforms maintenance operations</p>
          </div>
          
          <div className="grid grid-3">
            <div className="card solution-card fade-in">
              <div className="solution-icon">✅</div>
              <h3>Centralized Management</h3>
              <p>All equipment and maintenance data in one organized platform</p>
            </div>
            <div className="card solution-card fade-in">
              <div className="solution-icon">🎯</div>
              <h3>Proactive Scheduling</h3>
              <p>Preventive maintenance planning to avoid costly breakdowns</p>
            </div>
            <div className="card solution-card fade-in">
              <div className="solution-icon">📈</div>
              <h3>Actionable Insights</h3>
              <p>Real-time dashboards and reports to optimize maintenance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header text-center">
            <h2>Powerful Features</h2>
            <p>Everything you need to manage maintenance efficiently</p>
          </div>
          
          <div className="grid grid-2">
            <div className="feature-card card">
              <span className="feature-icon">🎯</span>
              <h3>Kanban Workflow</h3>
              <p>Visualize maintenance tasks with drag-and-drop Kanban boards. Track progress from NEW to REPAIRED.</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">📅</span>
              <h3>Calendar View</h3>
              <p>Schedule preventive maintenance and view upcoming tasks in an intuitive calendar interface.</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">👥</span>
              <h3>Team Management</h3>
              <p>Organize technicians into specialized teams and automatically route requests.</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">💰</span>
              <h3>Cost Tracking</h3>
              <p>Monitor maintenance costs, labor hours, and parts expenses for better budgeting.</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">🔐</span>
              <h3>Role-Based Access</h3>
              <p>Secure access control with distinct permissions for Users, Technicians, and Admins.</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">📱</span>
              <h3>Responsive Design</h3>
              <p>Access GearGuard from any device - desktop, tablet, or mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container text-center">
          <h2>Ready to Transform Your Maintenance?</h2>
          <p>Join hundreds of organizations using GearGuard to achieve zero downtime</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container text-center">
          <p>&copy; 2024 GearGuard. All rights reserved.</p>
          <p className="footer-subtitle">Built with ❤️ for hackathon</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
