import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png"

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/api/admins/admin-login", formData);
      setMessage(res.data.message);
      localStorage.setItem("adminEmail", formData.email);
      setTimeout(() => navigate("/admin-verify"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-150 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-6">
      <div className="w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">Tumana Admin Portal</h1>
          <p className="text-sky-700">Access your administrative dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-sky-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="h-2 bg-gradient-to-r from-sky-400 to-blue-600"></div>
          
          <div className="p-8">
            
            <div>
              <img src={digitalTumanaIcon} alt="" className="max-w-[30%] mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-sky-900 mb-2 text-center">Admin Login</h2>
            <p className="text-gray-600 text-sm text-center mb-6">Enter your credentials to continue</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-sky-800 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors text-sky-900 placeholder-sky-300"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-sky-800 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors text-sky-900 placeholder-sky-300"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
          
          <div className="bg-sky-50 p-4 text-center border-t border-sky-100">
            <p className="text-xs text-sky-700">
              Secure access to Tumana administration system
            </p>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-sky-600">
            &copy; {new Date().getFullYear()} Digital Tumana Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;