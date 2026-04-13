# TaskFlow — Task Management System

A full-stack **Task Management System** built with React, Node.js, Express, MongoDB, and Socket.io for real-time updates.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v3 |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas / Local MongoDB |
| **Auth** | JWT + bcrypt |
| **Real-time** | Socket.io |
| **File Storage** | Local (`/uploads`) with Multer |
| **API Docs** | Swagger UI |
| **Testing** | Jest + Supertest (backend) |
| **Containerization** | Docker + Docker Compose |

## 📋 Features

- **Authentication**: JWT-based registration, login, and session management
- **Role-based Access**: Admin and User roles with protected routes
- **Task Management**: Full CRUD with status, priority, due dates, and assignees
- **Filtering & Sorting**: Search, filter by status/priority, sort by multiple fields
- **Pagination**: Server-side pagination on all list endpoints
- **File Uploads**: PDF document attachments (max 3 per task, 5MB each)
- **Real-time Updates**: Live task changes via Socket.io
- **Admin Panel**: User management (CRUD) for admin users
- **Responsive Design**: Mobile-first, fully responsive UI
- **Dark Theme**: Premium glassmorphic dark mode design

## 🏗️ Project Structure

```
Task Management/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── api/                # Axios instance + API service modules
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Modal, Pagination, ProtectedRoute
│   │   │   ├── layout/         # Navbar, Layout
│   │   │   └── tasks/          # TaskCard, TaskFilters
│   │   ├── context/            # AuthContext, SocketContext, TaskContext
│   │   ├── pages/              # Dashboard, Tasks, Users, Auth
│   │   └── ...
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # db.js, swagger.js
│   │   ├── controllers/        # auth, task, user controllers
│   │   ├── middleware/          # auth, errorHandler, upload, validate
│   │   ├── models/             # User, Task models
│   │   ├── routes/             # auth, task, user routes
│   │   ├── utils/              # ApiError, ApiResponse, asyncHandler
│   │   └── validators/         # Validation rules
│   ├── tests/                  # Jest + Supertest
│   ├── uploads/                # Uploaded files
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
└── .env.example
```

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example server/.env
   # Edit server/.env with your MongoDB URI and JWT secret
   ```

3. **Start the backend**:
   ```bash
   cd server
   npm run dev     # Runs on http://localhost:5000
   ```

4. **Start the frontend** (in a separate terminal):
   ```bash
   cd client
   npm run dev     # Runs on http://localhost:3000
   ```

5. **View API documentation**:
   Open http://localhost:5000/api-docs

### Docker Compose

```bash
docker-compose up --build
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017
- **API Docs**: http://localhost:5000/api-docs

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `CLIENT_URL` | Frontend URL (CORS) | `http://localhost:3000` |

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register user | Public |
| POST | `/login` | Login | Public |
| GET | `/me` | Current user | Auth |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create task | Auth |
| GET | `/` | List tasks | Auth |
| GET | `/:id` | Get task | Auth |
| PUT | `/:id` | Update task | Owner/Admin |
| DELETE | `/:id` | Delete task | Owner/Admin |
| POST | `/:id/documents` | Upload PDFs | Owner/Admin |
| GET | `/:id/documents/:docId` | Download | Auth |
| DELETE | `/:id/documents/:docId` | Delete doc | Owner/Admin |

### Users (`/api/users`) — Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users |
| GET | `/:id` | Get user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

**Query Parameters**: `?status=`, `?priority=`, `?sort=`, `?order=`, `?page=`, `?limit=`, `?search=`

## 🧪 Testing

```bash
# Backend tests
cd server
npm test
```

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `task:created` | Server → Client | New task created |
| `task:updated` | Server → Client | Task modified |
| `task:deleted` | Server → Client | Task removed |
| `task:statusChanged` | Server → Client | Status changed |

## 📄 License

MIT
