import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage/HomePage';
import Auth from './pages/Auth/Auth';
import GoogleLoginSuccess from './pages/GoogleLoginSuccess/GoogleLoginSuccess';
import PrivateRoute from './components/PrivateRoute';
import UserLayout from './layout/UserLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Schedule from './pages/Schedule/SchedulePage';


function App() {
  return (
    // <AuthProvider>
    //   <Router>
    //     <Routes>
    //       {/* Wrap HomePage route with PrivateRoute to protect it */}
    //       <Route path="/" element={
    //         <PrivateRoute>
    //           <UserLayout>
    //             <HomePage />
    //           </UserLayout>
    //         </PrivateRoute>
    //       } />
    //       <Route path="/auth" element={<Auth />} />
    //       <Route path="/google-login-success" element={<GoogleLoginSuccess />} />
    //     </Routes>
    //   </Router>
    // </AuthProvider>

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } />
        {/* <Route path="/tasks" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } /> */}
        <Route path="/schedule" element={
          <UserLayout>
            <Schedule />
          </UserLayout>
        } />
        {/* <Route path="/timer" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } />
        <Route path="/analytics" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } />
        <Route path="/profile" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } />
        <Route path="/help" element={
          <UserLayout>
            <Dashboard />
          </UserLayout>
        } /> */}

        <Route path="/auth" element={<Auth />} />
        <Route path="/google-login-success" element={<GoogleLoginSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
