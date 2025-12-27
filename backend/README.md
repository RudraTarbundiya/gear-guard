# GearGuard Backend API

## Overview
RESTful API for GearGuard maintenance management system built with Node.js and Express.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gearguard_db
JWT_SECRET=your_secret_key
```

### 3. Initialize Database
```bash
npm run init-db
```

This will:
- Create the database
- Create all tables
- Seed sample data
- Create default users

### 4. Start Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication
```
POST   /auth/register    Register new user
POST   /auth/login       Login user
GET    /auth/me          Get current user info
```

#### Equipment
```
GET    /equipment        Get all equipment
GET    /equipment/:id    Get single equipment
POST   /equipment        Create equipment (Admin)
PUT    /equipment/:id    Update equipment (Admin)
DELETE /equipment/:id    Delete equipment (Admin)
```

#### Requests
```
GET    /requests         Get requests (role-based filtering)
GET    /requests/:id     Get single request
POST   /requests         Create request
PUT    /requests/:id     Update request (Admin/Technician)
PUT    /requests/:id/assign  Assign technician
DELETE /requests/:id     Delete request (Admin)
```

#### Teams
```
GET    /teams            Get all teams
GET    /teams/:id        Get team details
POST   /teams            Create team (Admin)
PUT    /teams/:id        Update team (Admin)
DELETE /teams/:id        Delete team (Admin)
```

#### Dashboard
```
GET    /dashboard/stats      Get statistics (role-based)
GET    /dashboard/activity   Get recent activity
```

## Database Schema

See main README.md for complete schema.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features
- JWT authentication
- Password hashing (bcrypt)
- Role-based authorization
- CORS enabled
- SQL injection protection (parameterized queries)
