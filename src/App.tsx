import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth/Auth';
import GoogleLoginSuccess from './pages/GoogleLoginSuccess/GoogleLoginSuccess';
import PrivateRoute from './components/PrivateRoute';
import UserLayout from './layout/UserLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Schedule from './pages/Schedule/SchedulePage';
import FocusTimer from './pages/FocusTime/FocusTimerPage';
import TaskManagement from "./pages/TaskManagement/TaskManagement";
import Analytics from './pages/Analytics/Analytics';
import ProFilePage from './pages/Profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/google-login-success" element={<GoogleLoginSuccess />} />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserLayout>
                  <ProFilePage />
                </UserLayout>
              </PrivateRoute>
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <UserLayout>
                  <TaskManagement />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Schedule />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/timer"
            element={
              <PrivateRoute>
                <UserLayout>
                  <FocusTimer />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Analytics />
                </UserLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
