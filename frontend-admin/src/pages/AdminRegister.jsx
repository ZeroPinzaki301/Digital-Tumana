import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axiosInstance.post("/api/admins/register-admin", formData);
      setMessage(res.data.message);
      setTimeout(() => navigate("/admin-login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Admin registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-200 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-sky-900">
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Admin Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name (Optional)"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-sky-900 rounded-lg focus:outline-none focus:ring focus:ring-sky-900"
          />
          <button
            type="submit"
            className="w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
          >
            Register Admin
          </button>
        </form>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AdminRegister;