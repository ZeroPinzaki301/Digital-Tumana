import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png"

const AdminVerify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem("adminEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/api/admins/verify-admin-login", { email, code });
      localStorage.setItem("adminToken", res.data.token);
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setMessage("");
    
    try {
      const res = await axiosInstance.post("/api/admins/resend-verification", { email });
      setMessage(res.data.message || "Verification code sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code. Please try again.");
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-6">
      <div className="w-full max-w-150">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">Secure Verification</h1>
          <p className="text-sky-700">Verify your identity to continue</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-sky-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="h-2 bg-gradient-to-r from-sky-400 to-blue-600"></div>
          
          <div className="p-8">
            <div>
              <img src={digitalTumanaIcon} alt="" className="max-w-[30%] mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-sky-900 mb-2 text-center">Two-Factor Verification</h2>
            <p className="text-gray-600 text-sm text-center mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sky-700 font-medium text-center mb-6">{email}</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-sky-800 mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      className="w-12 h-12 border border-sky-200 rounded-lg text-center text-xl font-semibold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                      value={code[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d?$/.test(value)) {
                          const newCode = code.split('');
                          newCode[index] = value;
                          setCode(newCode.join(''));
                          
                          // Auto-focus to next input
                          if (value && index < 5) {
                            document.getElementById(`digit-${index + 1}`).focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !code[index] && index > 0) {
                          document.getElementById(`digit-${index - 1}`).focus();
                        }
                      }}
                      id={`digit-${index}`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  className="absolute opacity-0 -left-full"
                  value={code}
                  onChange={handleCodeChange}
                  id="verificationCode"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="cursor-pointer w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <button
                onClick={handleResendCode}
                className="text-sky-600 hover:text-sky-800 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend verification code
              </button>
            </div>
            
            {message && (
              <div className="mt-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 极 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
          
          <div className="bg-sky-50 p-4 text-center border-t border-sky-100">
            <p className="text-xs text-sky-700">
              For security reasons, this code will expire in 10 minutes
            </p>
          </div>
        </div>
        
        {/* Back to login option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/admin-login")}
            className="text-sky-600 hover:text-sky-800 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerify;