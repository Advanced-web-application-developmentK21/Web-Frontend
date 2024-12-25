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
import ProFilePage from './pages/Profile/ProfilePage';
import AnalyticsPage from './pages/Analytics/Analytics';

const protectedRoutes = [
  { path: "/home", component: <Dashboard /> },
  { path: "/tasks", component: <TaskManagement /> },
  { path: "/schedule", component: <Schedule /> },
  { path: "/timer", component: <FocusTimer /> },
  { path: "/analytics", component: <AnalyticsPage /> },
  { path: "/profile", component: <ProFilePage /> },
  { path: "/help", component: <Dashboard /> }, // Assuming /help is the same as Dashboard
];

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

          {/* Protected routes */}
          {protectedRoutes.map(({ path, component }) => (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute>
                  <UserLayout>
                    {component}
                  </UserLayout>
                </PrivateRoute>
              }
            />
          ))}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
