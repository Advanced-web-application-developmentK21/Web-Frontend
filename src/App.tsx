import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage/HomePage';
import Auth from './pages/Auth/Auth';
import GoogleLoginSuccess from './pages/GoogleLoginSuccess/GoogleLoginSuccess';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Wrap HomePage route with PrivateRoute to protect it */}
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/google-login-success" element={<GoogleLoginSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
