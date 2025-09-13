import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const KaritonVerifyResetCode = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("karitonResetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axiosInstance.post("/api/kariton/verify-login-reset-code", { 
        email, 
        code 
      });
      setMessage("Code verified successfully!");
      
      // Store code in localStorage
      localStorage.setItem("karitonResetCode", code);
      
      // Navigate immediately
      navigate("/kariton/reset-login-code");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    }
  };

  if (!email) {
    navigate("/kariton/forgot-login-code");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">Verify Reset Code</h2>
        <p className="mb-4 text-gray-700 text-center">Enter the 6-digit code sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-center text-xl tracking-widest"
          />
          <button
            type="submit"
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Verify Code
          </button>
        </form>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default KaritonVerifyResetCode;