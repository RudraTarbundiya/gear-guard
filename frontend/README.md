# GearGuard Frontend

## Overview
React-based frontend for GearGuard maintenance management system.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

App runs on `http://localhost:3000`

## Features

### Pages
- **Landing** - Marketing page with features
- **Login/Register** - Authentication
- **Dashboard** - Role-based overview
- **Equipment** - Equipment management (Admin)
- **Requests** - Maintenance requests
- **Kanban** - Drag-and-drop workflow
- **Calendar** - Scheduled maintenance
- **Teams** - Team management (Admin)

### Components
- **Navbar** - Navigation with role-based links
- **PrivateRoute** - Protected route wrapper
- **AuthContext** - Global authentication state

## User Roles

### USER
- Create requests
- View own requests
- Track status

### TECHNICIAN
- View team requests
- Assign to self
- Update status & costs
- Access Kanban & Calendar

### ADMIN
- All TECHNICIAN features
- Manage equipment
- Manage teams
- View all requests

## Build for Production
```bash
npm run build
```

Creates optimized build in `build/` directory.

## Key Technologies
- React 18
- React Router DOM v6
- React Beautiful DnD
- React Calendar
- React Toastify
- Axios

## Folder Structure
```
src/
├── components/     # Reusable components
├── context/        # React context (Auth)
├── pages/          # Page components
├── utils/          # Helper functions (API)
├── App.js          # Main app component
└── index.js        # Entry point
```

## Styling
- Custom CSS (no framework)
- CSS variables for theming
- Responsive design
- Smooth animations

## Default Credentials
```
Admin: admin@gearguard.com / password123
Tech: tech1@gearguard.com / password123
User: user@gearguard.com / password123
```
