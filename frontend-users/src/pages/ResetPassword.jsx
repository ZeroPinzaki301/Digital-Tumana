import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("resetEmail");
  const code = localStorage.getItem("resetCode");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/users/reset-password", {
        email,
        code,
        newPassword,
      });

      setMessage(res.data.message);
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetCode");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-lime-700 mb-4">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700"
          />
          <button
            type="submit"
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Change Password
          </button>
        </form>
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;