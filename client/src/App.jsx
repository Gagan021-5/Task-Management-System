import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TaskListPage from './pages/TaskListPage';
import TaskFormPage from './pages/TaskFormPage';
import TaskDetailPage from './pages/TaskDetailPage';
import UserListPage from './pages/UserListPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <TaskProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskListPage />} />
                <Route path="/tasks/new" element={<TaskFormPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <UserListPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TaskProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
