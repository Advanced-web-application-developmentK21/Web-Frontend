import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { UserInfo } from "../../types/type";

interface EditProfileProps {
  onClose: () => void;
  userData: UserInfo;
  onSave: (updatedData: UserInfo) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
  onClose,
  userData,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserInfo>(userData);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [password, setPassword] = useState(userData.userPassword);
  const [confirmPassword, setConfirmPassword] = useState(userData.userPassword);
  const [accessToken, setToken] = useState(localStorage.getItem("token"));

  const handleSave = async () => {
    const updatedUserData = {
      username: formData.userName,
      email: formData.userEmail,
      gender: formData.userGender,
    };

    console.log("userData.userId:", userData.userId);

    if (!userData.userId) {
      console.error("userId is missing");
      Swal.fire({
        title: "Error!",
        text: "User ID is missing. Cannot update profile.",
        icon: "error",
      });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/user/update-user/${userData.userId}`,
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("response:", response.data);

      onSave(response.data.data);
      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully.",
        icon: "success",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update profile. Please try again later.",
        icon: "error",
      });
    }
  };
  const handlePasswordChange = async () => {
    const updatedPassword = {
      password: password,
      username: formData.userName,
      email: formData.userEmail,
    };

    console.log("userData.userId:", userData.userId);

    if (!userData.userId) {
      console.error("userId is missing");
      Swal.fire({
        title: "Error!",
        text: "User ID is missing. Cannot update profile.",
        icon: "error",
      });
      return;
    }
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match. Please try again.",
        icon: "error",
      });
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:4000/user/change-password/${userData.userId}`,
        updatedPassword
      );
      console.log("response:", response.data);
      onSave(response.data);
      Swal.fire({
        title: "Success!",
        text: "Password updated successfully.",
        icon: "success",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update password:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update password. Please try again later.",
        icon: "error",
      });
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, userGender: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-full max-w-lg p-6 bg-[#e6f4f1] rounded-lg shadow-lg transform transition-all">
        <h2 className="text-2xl text-center px-4 mb-6 py-2 rounded-lg font-bold text-white bg-[#008b8b]">
          Edit Profile
        </h2>
        {!showChangePassword ? (
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                Gender
              </label>
              <select
                name="userGender"
                value={formData.userGender}
                onChange={handleGenderChange}
                className="w-full border rounded p-2"
                disabled
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Change Password Toggle */}
            <div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-indigo-500 hover:underline"
              >
                {showChangePassword
                  ? "Cancel Change Password"
                  : "Change Password"}
              </button>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Save Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
