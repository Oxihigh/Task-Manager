# Team Task Management System

A full-stack task management application with React, Tailwind CSS, and a Node.js/Express backend.

## 🚀 Getting Started

You need to run both the backend and frontend servers.

### 1. Start the Backend
```bash
cd backend
npm install
npm run seed  # Seeds the database with mock data
npm start     # Runs on http://localhost:3000
```

### 2. Start the Frontend
```bash
# Open a new terminal
cd frontend  # or root directory if not separated
npm install
npm run dev
```

## 🔑 Login Info
The app uses a simulated login system. 
- Go to `http://localhost:5173`
- Select **Aarav Patel** (Admin) for full access.
- Select other users to test permission restrictions.

## 🛠️ Features
- **Dashboard**: Real-time stats and workload chart.
- **Tasks**: Create, edit, and bulk update tasks.
- **Kanban**: Drag-and-drop board.
- **Rules**:
    - Status transitions (e.g., Pending -> In Progress).
    - Dependencies: Cannot start task if parent is not done.
    - Permissions: Only Assignee or Admin can update.
