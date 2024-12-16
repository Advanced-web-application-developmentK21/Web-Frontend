import React, { useEffect, useState } from "react";
import { FaEnvelope, FaUser, FaLock, FaVenusMars, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProFilePage: React.FC = () => {
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center">
            <p className="text-lg font-semibold text-gray-800">
              You need to log in to view your profile.
            </p>
            <div className="mt-4">
              <button
                onClick={handleAlertClose}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
              >
                OK
              </button>
            </div>
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
