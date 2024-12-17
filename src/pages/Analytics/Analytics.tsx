import React, { useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Analytics: React.FC = () => {
    const { userId, userName, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const handleLogout = async (): Promise<void> => {
        try {
            // Send a POST request using axios
            const response = await axios.post(`http://localhost:4000/user/logout/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) { // Check if the response status is 200 (success)
                logout();
                setIsDropdownOpen(false); // Close the dropdown after logout
                navigate("/auth"); // Redirect to login page
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };
    
    // const handleProfile = (): void => {
    //     navigate("/profile"); // Navigate to the profile page
    //     setIsDropdownOpen(false); // Close the dropdown when navigating to profile
    // };

    const toggleDropdown = (): void => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen p-4 relative"
            style={{
                background: "linear-gradient(to bottom right, #4a90e2, #50c9c3, #3a7bd5)",
            }}
        >
            {/* Avatar with Dropdown */}
            <div className="absolute top-4 right-4">
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-bold text-lg hover:scale-110 transition-transform"
                        aria-label="Profile"
                    >
                        {userId ? (
                            <FaUser className="text-xl" />
                        ) : (
                            <span className="text-xl">{userName ? userName[0].toUpperCase() : "G"}</span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg">
                            <button
                                //onClick={handleProfile}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <FaUser className="mr-2" /> Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <FaSignOutAlt className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h1 className="text-4xl font-bold text-center text-white">
                Welcome,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-800 to-red-900">
                    {userId ? userName : "Guest"}
                </span>
                !
            </h1>

            <div className="text-center space-y-2 text-white mt-6">
                <h2 className="text-2xl font-semibold">FINAL PROJECT</h2>
                <p className="text-lg">PROJECT - AI-POWERED STUDY PLANNER</p>
            </div>

            {/* Always render sensitive information */}
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl max-w-lg w-full space-y-6 mt-8">
                <h3 className="text-2xl font-semibold text-center text-gray-800">Project Creators</h3>

                <div className="space-y-3">
                    <p className="text-lg">
                        <strong className="font-medium text-gray-700">Student ID1:</strong> 21127228 - Nguyễn Gia Bảo
                    </p>
                    <p className="text-lg">
                        <strong className="font-medium text-gray-700">Student ID2:</strong> 21127116 - Nguyễn Lê Thanh Nghĩa
                    </p>
                    <p className="text-lg">
                        <strong className="font-medium text-gray-700">Student ID3:</strong> 21127654 - Nguyễn Đức Nhã
                    </p>
                </div>

                <div className="mt-4 space-y-2">
                    <p className="text-lg">
                        <strong className="font-medium text-gray-700">Class:</strong> 21KTPM2 | University of Science, VNU-HCM
                    </p>
                    <p className="text-lg">
                        <strong className="font-medium text-gray-700">Supervisors:</strong> Nguyễn Huy Khánh (Theory), Mai Anh Tuấn
                        (Practice), Đỗ Nguyên Kha (Practice), Trần Duy Quang (Practice)
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Analytics;
