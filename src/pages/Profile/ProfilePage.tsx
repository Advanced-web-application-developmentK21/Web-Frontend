import React, { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaUser,
  FaLock,
  FaEdit,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { UserInfo } from "../../types/type";
import axios from "axios";
import EditProfile from "./EditProfile";

const ProFilePage: React.FC = () => {
  const [accessToken] = useState(localStorage.getItem("token"));
  const { isDarkMode } = useTheme();
  const userId = localStorage.getItem("userId");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserInfo>({
    userId: userId || "",
    userName: "",
    userEmail: "",
    userPassword: "", // Add a default or fetched value
  });
  const [toggleEditProfileModal, setToggleEditProfileModal] =
    useState<boolean>(false);
  const handleClosePopup = () => {
    setToggleEditProfileModal(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!accessToken || !userId) {
        setShowAlert(true);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:4000/user/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUserDetails({
          userId: userId || "",
          userName: response.data.data.username,
          userEmail: response.data.data.email,
          userPassword: userDetails.userPassword,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);
  useEffect(() => {
    if (!userId || !accessToken) {
      setShowAlert(true);
    }
  }, [userId, accessToken]);

  const handleSave = async (updatedData: UserInfo) => {
    // Update the user details
    setUserDetails(updatedData);
    
    // Fetch the updated user data from the server
    const userId = localStorage.getItem("userId");
    if (!accessToken || !userId) {
      setShowAlert(true);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:4000/user/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserDetails({
        userId: userId || "",
        userName: response.data.data.username,
        userEmail: response.data.data.email,
        userPassword: userDetails.userPassword,
      });
    } catch (error) {
      console.error("Failed to fetch updated user data:", error);
    }
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
              onClick={() => (window.location.href = "/auth")} // Redirect to the login page
              className={`py-3 px-10 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform ${
                isDarkMode
                  ? "bg-blue-700 text-white hover:bg-blue-800 hover:scale-105"
                  : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
              }`}
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {!showAlert && userId && accessToken && (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl flex relative">
          {/* Left: Avatar Section */}
          <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-b from-indigo-600 to-purple-600 text-white p-8">
            <img
              className="h-40 w-40 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-all duration-500"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Avatar"
            />
            <h2 className="mt-6 text-2xl font-bold">{userDetails.userName}</h2>
            <p className="text-sm text-gray-200">Software Engineer</p>
          </div>

          {/* Right: User Information Section */}
          <div className="flex-1 p-8 relative">
            {/* Edit Profile Icon */}
            <button
              onClick={() => setToggleEditProfileModal(!toggleEditProfileModal)}
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
                  Email:{" "}
                  <span className="text-gray-600">{userDetails.userEmail}</span>
                </p>
              </div>
              {/* Username */}
              <div className="flex items-center space-x-4">
                <FaUser className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Username:{" "}
                  <span className="text-gray-600">{userDetails.userName}</span>
                </p>
              </div>
              {/* Password */}
              <div className="flex items-center space-x-4">
                <FaLock className="text-indigo-600 text-2xl" />
                <p className="text-lg">
                  Password:{" "}
                  <span className="text-gray-600">{"*".repeat(10)}</span>
                </p>
              </div>
              {/* Gender */}
            </div>
          </div>
        </div>
      )}
      {!toggleEditProfileModal ? null : (
        <EditProfile
          onClose={handleClosePopup}
          userData={userDetails}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProFilePage;
