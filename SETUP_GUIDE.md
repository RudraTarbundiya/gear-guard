# 🚀 GearGuard - Complete Setup Guide

## Step-by-Step Installation

### Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js v14+ installed (`node --version`)
- ✅ MySQL v8+ installed and running
- ✅ npm or yarn package manager
- ✅ Git (optional)

---

## 🗄️ Step 1: Database Setup

### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database (optional - auto-created by init script)
CREATE DATABASE gearguard_db;

# Exit MySQL
exit;
```

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Database will be auto-created by init script

---

## 🔧 Step 2: Backend Setup

```bash
# Navigate to backend directory
cd gearguard/backend

# Install dependencies
npm install

# This will install:
# - express (web framework)
# - mysql2 (database driver)
# - bcryptjs (password hashing)
# - jsonwebtoken (authentication)
# - cors (cross-origin support)
# - dotenv (environment variables)
```

### Configure Environment Variables
1. Open `backend/.env` file
2. Update MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=gearguard_db
```

### Initialize Database
```bash
npm run init-db
```

**Expected Output:**
```
📦 Connected to MySQL server
✅ Database 'gearguard_db' created/verified
✅ Created MAINTENANCE_TEAMS table
✅ Created USERS table
✅ Created EQUIPMENT table
✅ Created MAINTENANCE_REQUESTS table
✅ Seeded MAINTENANCE_TEAMS
✅ Seeded USERS (password: password123)
✅ Seeded EQUIPMENT
✅ Seeded MAINTENANCE_REQUESTS

🎉 Database initialization completed successfully!

📝 Default login credentials:
   Admin: admin@gearguard.com / password123
   User: user@gearguard.com / password123
   Technician: tech1@gearguard.com / password123
```

### Start Backend Server
```bash
npm start

# Or for development with auto-reload:
npm run dev
```

**Expected Output:**
```
═══════════════════════════════════════════════
🚀 GearGuard API Server Started
═══════════════════════════════════════════════
📡 Server running on: http://localhost:5000
🌍 Environment: development
📊 API Documentation: http://localhost:5000/
═══════════════════════════════════════════════
✅ Database connected successfully
```

### Test Backend API
Open browser and visit: `http://localhost:5000`

You should see:
```json
{
  "success": true,
  "message": "Welcome to GearGuard API",
  "version": "1.0.0"
}
```

---

## 🎨 Step 3: Frontend Setup

**Open a new terminal** (keep backend running)

```bash
# Navigate to frontend directory
cd gearguard/frontend

# Install dependencies
npm install

# This will install:
# - react & react-dom (UI library)
# - react-router-dom (routing)
# - axios (HTTP client)
# - react-beautiful-dnd (drag & drop)
# - react-calendar (calendar component)
# - react-toastify (notifications)
```

### Configure Environment
The `.env` file is already configured:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start Frontend
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view gearguard-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

Browser will automatically open to `http://localhost:3000`

---

## ✅ Step 4: Verify Installation

### 1. Landing Page
- You should see the GearGuard landing page
- Hero section with "Zero Downtime Starts Here"
- Feature cards and CTA buttons

### 2. Test Login
Click "Login" and use:
```
Email: admin@gearguard.com
Password: password123
```

### 3. Explore Features
After login, you should be able to:
- ✅ View dashboard with statistics
- ✅ Navigate to Equipment page
- ✅ View Teams
- ✅ Access Kanban board
- ✅ View Calendar
- ✅ Create and view requests

---

## 🎯 Quick Test Checklist

### Admin Features
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Create new equipment
- [ ] Create maintenance team
- [ ] View all requests
- [ ] Access Kanban board
- [ ] Schedule maintenance in calendar

### Technician Features
- [ ] Login as technician (tech1@gearguard.com)
- [ ] View team's requests
- [ ] Assign request to self in Kanban
- [ ] Update request status
- [ ] Add cost estimation
- [ ] Add completion notes

### User Features
- [ ] Login as user (user@gearguard.com)
- [ ] Create maintenance request
- [ ] Select equipment
- [ ] View own requests only
- [ ] Track request status

---

## 🐛 Troubleshooting

### Issue: Database connection failed
**Solution:**
1. Ensure MySQL is running
2. Check credentials in `backend/.env`
3. Verify MySQL port (default 3306)

### Issue: Port 5000 already in use
**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

### Issue: CORS errors
**Solution:**
- Ensure backend is running
- Check `REACT_APP_API_URL` in frontend/.env
- Restart both servers

### Issue: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: React app won't start
**Solution:**
```bash
# Clear npm cache
npm cache clean --force
npm install
npm start
```

---

## 📊 Default Data

### Users (all passwords: password123)
- **admin@gearguard.com** - Admin
- **user@gearguard.com** - User
- **tech1@gearguard.com** - Technician (Electrical Team)
- **tech2@gearguard.com** - Technician (Mechanical Team)
- **tech3@gearguard.com** - Technician (HVAC Team)
- **tech4@gearguard.com** - Technician (IT Support Team)

### Teams
- Electrical Team
- Mechanical Team
- HVAC Team
- IT Support Team

### Equipment (10 items)
- Generator 5000W
- Air Compressor
- Hydraulic Press
- HVAC Unit - Central
- Server Rack Dell R740
- Forklift Toyota
- CNC Machine
- Backup Generator
- Cooling Tower
- UPS System

### Requests (8 sample requests)
- Various statuses (NEW, IN_PROGRESS, REPAIRED)
- Both CORRECTIVE and PREVENTIVE types
- Assigned to different teams

---

## 🎓 Usage Tips

### Creating Your First Request
1. Login as user
2. Click "Create Request"
3. Fill in subject and select equipment
4. Choose request type
5. Optionally set scheduled date
6. Submit

### Using Kanban Board
1. Login as technician or admin
2. Navigate to Kanban
3. Drag cards between columns to update status
4. Click card to view details
5. Assign tasks to yourself

### Managing Equipment (Admin)
1. Login as admin
2. Navigate to Equipment
3. Click "+ Add Equipment"
4. Fill in details
5. Assign to a team
6. Submit

---

## 🚢 Production Deployment

### Backend
```bash
cd backend
npm run build  # If you have build script
# Deploy to your server (AWS, Heroku, etc.)
```

### Frontend
```bash
cd frontend
npm run build
# Serve the 'build' folder with nginx/Apache
```

### Environment Variables (Production)
Update `.env` files with production values:
- Database host
- Secure JWT secret
- API URLs
- CORS origins

---

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Review API endpoints in backend/README.md
3. Check frontend architecture in frontend/README.md
4. Verify database schema matches requirements

---

## 🎉 Success!

If you can:
- ✅ See the landing page
- ✅ Login with demo credentials
- ✅ Navigate between pages
- ✅ Create and view data
- ✅ Use Kanban board
- ✅ View calendar

**Congratulations! GearGuard is ready to use! 🚀**

---

**Happy Hacking! Built with ❤️ for the Hackathon**
