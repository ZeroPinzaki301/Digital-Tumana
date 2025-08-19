import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    agreedToPolicy: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/users/register", formData);
      alert(response.data.message);
      localStorage.setItem("emailForVerification", formData.email);
      navigate("/verify-email");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Welcome Section */}
        <div className="w-full md:w-1/2 bg-lime-600 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Welcome to</h1>
          <img
            src={digitalTumanaIcon}
            alt="Digital Tumana Icon"
            className="mx-auto mt-4 w-24 h-24 md:w-32 md:h-32"
          />
          <h1 className="font-sans text-2xl font-bold text-white mt-2">Digital Tumana</h1>
        </div>

        {/* Right: Registration Form */}
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-xl font-bold text-lime-700 text-center mb-4">Create an Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
            />

            {/* Password with Eye Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lime-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
            />
            <label className="flex items-center space-x-2 text-lg">
              <input
                type="checkbox"
                name="agreedToPolicy"
                onChange={handleChange}
                required
                className="accent-lime-700"
              />
              <span>I agree to the policy</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-lg"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-lg text-gray-700 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-lime-700 font-bold hover:underline">
              Sign in.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
