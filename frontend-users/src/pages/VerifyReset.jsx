import { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyReset = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code");
      return;
    }

    // Store code for use in reset password step
    localStorage.setItem("resetCode", code);
    navigate("/reset-password");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">Verify Reset Code</h2>
        <p className="mb-4 text-gray-700 text-center">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-center text-xl tracking-widest"
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Continue
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyReset;