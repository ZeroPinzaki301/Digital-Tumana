import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    sex: "",
    birthdate: "",
    agreedToPolicy: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, "");
    const limitedNumbers = numbersOnly.slice(0, 11);
    setFormData({ ...formData, phoneNumber: limitedNumbers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phoneNumber.length !== 11) {
      setModalMessage("Phone number must be exactly 11 digits");
      setShowMessageModal(true);
      return;
    }

    if (!formData.sex) {
      setModalMessage("Please select your gender");
      setShowMessageModal(true);
      return;
    }

    if (!formData.birthdate) {
      setModalMessage("Please enter your birthdate");
      setShowMessageModal(true);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/users/register", formData);
      setModalMessage(response.data.message);
      setShowMessageModal(true);
      localStorage.setItem("emailForVerification", formData.email);
      setTimeout(() => navigate("/verify-email"), 2000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Registration failed");
      setShowMessageModal(true);
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
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-lg font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>

            {/* Middle Name (Optional) */}
            <div>
              <label htmlFor="middleName" className="block text-lg font-medium text-gray-700">
                Middle Name <span className="text-sm text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                name="middleName"
                id="middleName"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-lg font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="mt-3.5 absolute right-3 top-9 transform -translate-y-1/2 text-lime-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label htmlFor="phoneNumber" className="block text-lg font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                required
                pattern="[0-9]{11}"
                maxLength={11}
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              {formData.phoneNumber.length > 0 && (
                <span className="absolute right-3 top-9 transform -translate-y-1/2 text-sm text-gray-500">
                  {formData.phoneNumber.length}/11
                </span>
              )}
            </div>

            {/* Sex/Gender */}
            <div>
              <label htmlFor="sex" className="block text-lg font-medium text-gray-700">Gender</label>
              <select
                name="sex"
                id="sex"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Birthdate */}
            <div>
              <label htmlFor="birthdate" className="block text-lg font-medium text-gray-700">Birthdate</label>
              <input
                type="date"
                name="birthdate"
                id="birthdate"
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
            </div>

            {/* Policy Agreement */}
            <label className="flex items-center space-x-2 text-lg">
              <input
                type="checkbox"
                name="agreedToPolicy"
                onChange={handleChange}
                required
                className="accent-lime-700"
              />
              <span className="cursor-pointer" onClick={() => setShowPolicyModal(true)}>
                I agree to the policy
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-lg cursor-pointer"
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

      {/* Modal for Privacy Policy */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-orange-700 mb-4">Customer Privacy & Compliance Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                This policy outlines the responsibilities and requirements for customers registering on our platform, especially in relation to the handling of fresh produce and agricultural goods.
              </p>
              <p>
                <strong>Identity Verification:</strong> All customers must provide valid personal information and a government-issued ID to verify identity. This helps prevent fraud and ensures accountability.
              </p>
              <p>
                <strong>Order Compliance:</strong> Customers must honor all placed orders, be available for delivery or pickup, and understand that non-compliance may result in cancellation or account suspension.
              </p>
              <p>
                <strong>Data Protection:</strong> Customer data is securely stored and never shared with third parties except as required by law or to fulfill orders.
              </p>
              <p>
                <strong>Policy Updates:</strong> This policy may be updated periodically. Customers will be notified via email or platform notifications.
              </p>
            </div>
            <button
              onClick={() => setShowPolicyModal(false)}
              className="mt-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Success/Error Messages */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg text-gray-800">{modalMessage}</p>
            <button
              onClick={() => setShowMessageModal(false)}
              className="mt-4 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
