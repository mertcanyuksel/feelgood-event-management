# FEELGOOD Event Management System

Modern event management system built with React and Node.js for Hillside BTS.

## 🚀 Features

- **Event Management** - CRUD operations for events
- **Excel-like Filtering** - Column-based dropdown filters
- **Drag & Drop** - Reorderable table columns
- **User Management** - Admin-only user administration
- **Session Authentication** - Secure bcrypt-based auth
- **Color-coded Rows** - Visual indicators for new/modified/deleted records
- **Responsive Design** - Works on all screen sizes

## 📋 Tech Stack

### Backend
- Node.js + Express
- MSSQL Database
- bcryptjs (password hashing)
- express-session (authentication)

### Frontend
- React 18
- Axios (HTTP client)
- @dnd-kit (drag & drop)
- React Hot Toast (notifications)

## 🛠️ Installation

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed deployment instructions.

### Quick Start (Development)

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Production (PM2)

```bash
# Install PM2
npm install -g pm2
npm install -g serve

# Frontend build
cd frontend
npm run build

# Start with PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
```

## 🌐 Default Ports

- Backend: http://localhost:2025
- Frontend: http://localhost:2026
- API: http://localhost:2025/api

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── controllers/     # API controllers
│   ├── db/             # Database connection & scripts
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # React components
│       ├── services/   # API services
│       ├── styles/     # CSS files
│       └── utils/      # Utility functions
├── database/           # SQL scripts
├── ecosystem.config.js # PM2 configuration
├── DEPLOYMENT-GUIDE.md # Deployment instructions
└── PM2-DEPLOYMENT.md   # PM2 reference
```

## 🔐 Default Login

Create users using the script:

```bash
cd backend
node scripts/createUser.js admin admin123 "System Administrator"
```

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT-GUIDE.md) - Full deployment instructions
- [PM2 Guide](PM2-DEPLOYMENT.md) - PM2 commands and usage

## 🎨 Features in Detail

### Event Management
- Create, read, update events
- Excel-like column filtering
- Sortable columns
- Drag & drop column reordering
- Color-coded row status

### User Management (Admin Only)
- Create/edit/delete users
- Activate/deactivate users
- Secure password hashing

### Authentication
- Session-based auth
- Protected routes
- Admin role checking

## 🚀 Powered by

**Hillside BTS** - Business Technology Solutions

---

© 2024 Hillside BTS. All rights reserved.
