# Conflict Detection & Resolution System

A modern web application for detecting and resolving team task conflicts, built with React + TypeScript frontend designed to connect with your SQL database backend.

## 🚀 Features

- **Secure Authentication** - Role-based access (Manager/TeamMember)
- **Task Management** - Full CRUD operations for tasks
- **Conflict Detection** - Auto-detect resource, dependency, and schedule conflicts
- **Resolution Suggestions** - AI-powered recommendations
- **Dashboard** - Visual conflict indicators and statistics
- **Reports** - Export to CSV/PDF

## 📋 Project Structure

```
/src
├── pages/
│   ├── Login.tsx          - Authentication page
│   ├── Register.tsx       - User registration
│   ├── Dashboard.tsx      - Main overview
│   ├── Tasks.tsx          - Task management
│   ├── Conflicts.tsx      - Conflict detection & resolution
│   └── Reports.tsx        - Export functionality
├── components/
│   └── Layout.tsx         - Main layout with navigation
├── contexts/
│   └── AuthContext.tsx    - Authentication state
├── lib/
│   └── api.ts            - API service layer
└── types/
    └── index.ts          - TypeScript interfaces
```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Components:** shadcn/ui, Tailwind CSS
- **State:** React Context API, TanStack Query
- **Backend Integration:** REST API (Connect to Flask/Django/Node.js)
