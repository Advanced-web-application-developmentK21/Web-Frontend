import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the AuthContext value
interface AuthContextType {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPassword: string | null;
  userCreatedAt: string | null;
  token: string | null;
  login: (userDataId: string, userDataName: string, userEmail: string, userPassword: string, userCreatedAt: string, userToken: string) => void;
  loadProfileData: (userDataEmail: string, userDataPassword: string, userDataCreatedAt: string) => void;
  logout: () => void;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with default value of `null` (will be set later by the provider)
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to access the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Define the type for the provider's props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component with proper typing
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userPassword, setUserPassword] = useState<string | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Login function with necessary user details for authentication
  const login = (userDataId: string, userDataName: string, userEmail: string, userPassword: string, userCreatedAt: string, userToken: string) => {
    setUserId(userDataId);
    setUserName(userDataName);
    setUserEmail(userEmail);         // Store user_email
    setUserPassword(userPassword);   // Store user_password
    setUserCreatedAt(userCreatedAt); // Store user_created_at
    setToken(userToken);

    // Store all necessary data in localStorage
    localStorage.setItem('userId', userDataId);
    localStorage.setItem('userName', userDataName);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userPassword', userPassword);
    localStorage.setItem('userCreatedAt', userCreatedAt);
    localStorage.setItem('token', userToken);
};

  // Load additional profile data
  const loadProfileData = (userDataEmail: string, userDataPassword: string, userDataCreatedAt: string) => {
    setUserEmail(userDataEmail);
    setUserPassword(userDataPassword);
    setUserCreatedAt(userDataCreatedAt);

    // Store the profile data in localStorage as needed
    localStorage.setItem('userEmail', userDataEmail);
    localStorage.setItem('userPassword', userDataPassword);
    localStorage.setItem('userCreatedAt', userDataCreatedAt);
  };

  // Logout function
  const logout = () => {
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setToken(null);
    setUserPassword(null);
    setUserCreatedAt(null);

    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        userEmail,
        userPassword,
        userCreatedAt,
        token,
        login,
        logout,
        loadProfileData,
        isTimerRunning,
        setIsTimerRunning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
