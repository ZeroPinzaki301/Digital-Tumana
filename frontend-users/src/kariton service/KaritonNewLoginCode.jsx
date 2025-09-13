import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const KaritonNewLoginCode = () => {
  const [newLoginCode, setNewLoginCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const navigate = useNavigate();

  const email = localStorage.getItem("karitonResetEmail");
  const verificationCode = localStorage.getItem("karitonResetCode");

  const handleReset = async () => {
    if (!email || !verificationCode) {
      setError("Missing required information. Please start the process again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/api/kariton/reset-login-code", {
        email,
        code: verificationCode,
      });

      setNewLoginCode(res.data.newLoginCode);
      setResetCompleted(true);

      // Clear stored data
      localStorage.removeItem("karitonResetEmail");
      localStorage.removeItem("karitonResetCode");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset login code");
    } finally {
      setLoading(false);
    }
  };

  // Show error screen only if reset hasn't completed
  if ((!email || !verificationCode) && !resetCompleted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">Error</h2>
          <p className="text-center text-gray-700 mb-4">
            Session expired or missing information.
          </p>
          <button
            onClick={() => navigate("/kariton/forgot-login-code")}
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Show success screen
  if (resetCompleted && newLoginCode) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">
            New Login Code Generated
          </h2>
          <p className="mb-4 text-gray-700 text-center">
            Your new login code has been created successfully!
          </p>

          <div className="bg-lime-100 border border-lime-300 rounded-lg p-4 mb-4">
            <p className="text-center text-sm text-gray-600 mb-2">
              Your new login code:
            </p>
            <div className="text-center text-2xl font-mono font-bold text-lime-800 bg-white py-3 rounded border">
              {newLoginCode}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Please save this code securely. You will use it to log in to your rider dashboard.
            </p>
          </div>

          <button
            onClick={() => navigate("/kariton-service/login")}
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Default screen
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">Reset Login Code</h2>
        <p className="mb-4 text-gray-700 text-center">
          Ready to generate your new login code for <strong>{email}</strong>?
        </p>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/kariton/forgot-login-code")}
            className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate New Code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KaritonNewLoginCode;
