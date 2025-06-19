import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4">
      {/* Welcome Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-lime-700 md:text-4xl">Welcome to</h1>
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana Icon"
          className="mx-auto mt-2 w-20 h-20 md:w-32 md:h-32"
        />
        <h1 className="font-sans text-2xl font-bold text-lime-700 md:text-2xl">
          Digital Tumana
        </h1>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-lime-700 text-center mb-4">Create an Account</h2>

        <div className="space-y-4">
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
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
          />
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
        </div>
      </form>

      {/* Redirect to Login */}
      <p className="mt-4 text-lg text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-lime-700 font-bold hover:underline">
          Sign in.
        </Link>
      </p>
    </div>
  );
};

export default Register;