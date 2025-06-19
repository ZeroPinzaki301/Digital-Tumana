import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axiosInstance.post("/api/users/forgot-password", { email });
      setMessage(res.data.message);
      localStorage.setItem("resetEmail", email); // store for next step
      setTimeout(() => navigate("/verify-reset"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">Forgot Password</h2>
        <p className="mb-4 text-gray-700 text-center">Enter your email to receive a reset code.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700"
          />
          <button
            type="submit"
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Send Reset Code
          </button>
        </form>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;