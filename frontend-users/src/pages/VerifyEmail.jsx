import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve email from localStorage after registration
    const storedEmail = localStorage.getItem("emailForVerification");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No email found. Please register again.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/users/verify-email", { email, verificationCode });
      setMessage(response.data.message);
      setError("");

      // Store JWT token and userId in localStorage if the response includes them
      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user._id);
        localStorage.removeItem("emailForVerification"); // Clean up stored email after verification
        navigate("/account"); // Redirect to user account page
      } else {
        navigate("/login"); // Redirect to login page as fallback
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error verifying email.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-100 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg border border-lime-700">
        <h1 className="text-3xl font-bold text-lime-700 text-center mb-6">Verify Your Email</h1>

        {message && <p className="text-green-600 text-center mb-4 font-medium">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}

        {!error && (
          <form onSubmit={handleSubmit}>
            <p className="text-center text-gray-700 mb-6">
              Verification code sent to <strong className="text-lime-700">{email}</strong>
            </p>
            <div className="mb-4">
              <label htmlFor="verificationCode" className="block text-sm font-semibold text-lime-700">
                Enter Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                placeholder="Enter the code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-lg"
            >
              Verify Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;