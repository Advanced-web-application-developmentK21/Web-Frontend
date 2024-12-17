import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

function Dashboard() {
  const { userId, userName, logout } = useAuth();
  const navigate = useNavigate();

  // const handleLogout = async (): Promise<void> => {
  //   try {
  //     // Send a POST request using axios
  //     const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/user/logout/${userId}`, {}, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.status === 200) { // Check if the response status is 200 (success)
  //       logout();
  //       setIsDropdownOpen(false); // Close the dropdown after logout
  //       navigate("/auth"); // Redirect to login page
  //     } else {
  //       console.error("Logout failed");
  //     }
  //   } catch (error) {
  //     console.error("Error during logout:", error);
  //   }
  // };

  // const handleProfile = (): void => {
  //     navigate("/profile"); // Navigate to the profile page
  //     setIsDropdownOpen(false); // Close the dropdown when navigating to profile
  // };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 relative"
      style={{
        background: "linear-gradient(to bottom right, #1e3c72, #2a5298, #6dd5ed)",
      }}
    >
      {/* Welcome Section */}
      <h1 className="text-4xl font-extrabold text-center text-white mb-6 shadow-lg">
        Welcome,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-orange-500 animate-pulse">
          {userId ? userName : "Guest"}
        </span>
        !
      </h1>

      {/* Project Title Section */}
      <div className="text-center space-y-2 text-white">
        <h2 className="text-3xl font-bold tracking-wide">FINAL PROJECT</h2>
        <p className="text-lg italic tracking-wide">
          <span className="font-medium">PROJECT:</span> AI-POWERED STUDY PLANNER
        </p>
      </div>

      {/* Card Section */}
      <div className="bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-2xl w-full mt-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Project Creators
        </h3>

        {/* Student Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Person */}
          <p className="text-lg flex items-center space-x-2">
            <strong className="font-medium text-gray-700">ID1:</strong>
            <span>21127228 - Nguyễn Gia Bảo</span>
          </p>
          {/* Second Person */}
          <p className="text-lg flex items-center space-x-2">
            <strong className="font-medium text-gray-700">ID2:</strong>
            <span>21127654 - Nguyễn Đức Nhã</span>
          </p>

          {/* Third Person */}
          <p className="text-lg flex items-center space-x-2 col-span-2 justify-self-center">
            <strong className="font-medium text-gray-700">ID3:</strong>
            <span>21127116 - Nguyễn Lê Thanh Nghĩa</span>
          </p>
        </div>


        {/* Class & Supervisors */}
        <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
          <p className="text-lg flex items-center space-x-2">
            <strong className="font-medium text-gray-700">Class:</strong>
            <span>21KTPM2 | University of Science, VNU-HCM</span>
          </p>
          <p className="text-lg flex items-center space-x-2">
            <strong className="font-medium text-gray-700">Supervisors:</strong>
            <span>Nguyễn Huy Khánh (Theory), Mai Anh Tuấn (Practice), Đỗ Nguyên Kha (Practice), Trần Duy Quang (Practice)</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-white text-sm opacity-70">
        © 2024 AI-Powered Study Planner Team. All rights reserved.
      </footer>
    </div>
  );

}

export default Dashboard;
