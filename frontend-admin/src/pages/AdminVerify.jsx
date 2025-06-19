import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const AdminVerify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const email = localStorage.getItem("adminEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/admins/verify-admin-login", { email, code });
      localStorage.setItem("adminToken", res.data.token);
      setMessage(res.data.message);
      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code, try again");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-200 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-sky-900">
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Admin Verification</h2>
        <p className="mb-4 text-gray-700 text-center">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900 text-center text-lg tracking-widest"
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition text-lg"
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

export default AdminVerify;