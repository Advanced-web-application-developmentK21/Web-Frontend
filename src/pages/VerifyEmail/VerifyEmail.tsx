import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState('');

  const [countdown, setCountdown] = useState(60); // Countdown in seconds
  const [isCountdownActive] = useState(false); // To track if countdown is active

  const location = useLocation();
  const formData = location.state;

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer); // Clear the interval when the component is unmounted
    };
  }, [isCountdownActive, countdown]);

  const handleSignUp = async () => {


    //If code is correct => begin creating a new account
    try {
      const response = await axios.post(`http://localhost:4000/user/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Sign Up Successful!",
          text: "You can now log in.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";

      if (error.response) {
        console.error("Sign up error:", error.response.data);
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
      } else {
        console.error("Sign up error:", error.message);
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Sign Up Failed",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 py-12 px-6">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-2">Verify Email</h1>
        <h2 className="text-1xl text-center">
          We just emailed you a code to{" "}
          <strong>{formData.email}</strong>. Please enter the code below to confirm your email address.
        </h2>

        <div className="mb-2">
          <input
            type="text"
            placeholder="Enter verify code"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
          />
          <button
            type="submit"
            onClick={() => handleSignUp()}
            className="w-full py-3 mt-10 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
