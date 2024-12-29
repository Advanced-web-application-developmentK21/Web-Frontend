import React, { useEffect, useState } from "react";
import { FaEnvelope, FaUser, FaLock, FaVenusMars, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const ProFilePage: React.FC = () => {
  const [accessToken, setToken] = useState(localStorage.getItem('token'));
   const { isDarkMode } = useTheme();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userPassword = localStorage.getItem("userPassword") || ""; // Lấy mật khẩu từ localStorage
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    if (!userId || !token) {
      setShowAlert(true);
    }
  }, [userId, token]);

  const handleAlertClose = () => {
    setShowAlert(false);
    setTimeout(() => {
      navigate("/auth");
    }, 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8">
      {/* Alert for unauthenticated access */}
      {showAlert && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-sm w-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <p className="text-xl text-red-600 font-semibold mb-4">
              You must log in to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/auth'} // Redirect to the login page
              className={`py-3 px-10 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform ${isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-800 hover:scale-105' : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'}`}
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {!showAlert && userId && token && (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl flex relative">
          {/* Left: Avatar Section */}
          <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-b from-indigo-600 to-purple-600 text-white p-8">
            <img
              className="h-40 w-40 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-all duration-500"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Avatar"
            />
            <h2 className="mt-6 text-2xl font-bold">{userName}</h2>
            <p className="text-sm text-gray-200">Software Engineer</p>
          </div>

          {/* Right: User Information Section */}
          <div className="flex-1 p-8 relative">
            {/* Edit Profile Icon */}
            <button
              onClick={() => navigate("/edit-profile")}
              className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
            >
              <FaEdit className="text-2xl" title="Edit Profile" />
            </button>

            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
              Profile Information
            </h2>
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Email: <span className="text-gray-600">{userEmail}</span>
                </p>
              </div>
              {/* Username */}
              <div className="flex items-center space-x-4">
                <FaUser className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Username: <span className="text-gray-600">{userName}</span>
                </p>
              </div>
              {/* Password */}
              <div className="flex items-center space-x-4">
                <FaLock className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Password:{" "}
                  <span className="text-gray-600">
                    {"*".repeat(10)}
                  </span>
                </p>
              </div>
              {/* Gender */}
              <div className="flex items-center space-x-4">
                <FaVenusMars className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Gender: <span className="text-gray-600">Male</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProFilePage;
