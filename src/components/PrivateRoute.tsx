import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


// PrivateRoute component to protect routes that require authentication
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token } = useAuth(); // Access the token from AuthContext

  if (!token) {
    // If no token (i.e., not logged in), redirect to the /auth page
    return <Navigate to="/auth" />;
  }

  return children; // If user is authenticated, render the children (protected page)
};

export default PrivateRoute;
