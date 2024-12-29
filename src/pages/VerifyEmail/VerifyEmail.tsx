import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(9).fill('')); // Initialize with 9 empty fields
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email'); // Step can be 'email', 'code', or 'password'
  const [countdown, setCountdown] = useState(60); // Countdown in seconds
  const [isCountdownActive, setIsCountdownActive] = useState(false); // To track if countdown is active

  const location = useLocation();
  const formData = location.state;

  const navigate = useNavigate();

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

  const handleEmailSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:4000/user/forgot-password`, { email });
      setMessage(response.data.message);
      if (response.status === 200) {
        setStep('code');
        setIsCountdownActive(true); // Start countdown
        setCountdown(60); // Reset countdown
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleCodeChange = (e: any, index: number) => {
    const newCode = [...code];
    newCode[index] = e.target.value.slice(0, 1); // Limit to one character
    setCode(newCode);

    // Automatically focus on the next input field after entering a number
    if (e.target.value !== '' && index < 8) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleCodeSubmit = async (e: any) => {
    e.preventDefault();
    const codeInput = code.join('');
    try {
      const response = await axios.post(`http://localhost:4000/user/verify-code`, { email, code: codeInput });
      setMessage(response.data.message);
      if (response.status === 200) {
        setStep('password'); // Move to password input step
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleClearCode = () => {
    setCode(Array(9).fill(''));
  };

  const handleRetry = async () => {
    // Reset countdown and initiate a new email send request
    setCountdown(60);
    setIsCountdownActive(true);
    try {
      const response = await axios.post(`http://localhost:4000/user/forgot-password`, { email });
      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();
    const newPassword = e.target[0].value; // Lấy mật khẩu mới từ input
    const confirmPassword = e.target[1].value; // Lấy mật khẩu xác nhận từ input

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      // Gửi yêu cầu API để reset mật khẩu
      const response = await axios.post(`http://localhost:4000/user/reset-password`, {
        email,
        newPassword,
      });

      setMessage(response.data.message);

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Update Password Successful!',
          text: 'You can log in now!',
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/auth");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };


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
