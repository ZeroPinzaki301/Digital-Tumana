import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/api/users/login", formData);

      if (response.data.requiresVerification) {
        localStorage.setItem("emailForVerification", response.data.email);
        navigate("/verify-email");
        return;
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userFirstName", user.firstName);
      window.dispatchEvent(new Event('storage')); // Add this line
      navigate("/");

    } catch (err) {
      if (err.response?.status === 400) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        localStorage.setItem("emailForVerification", formData.email);
        navigate("/verify-email");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4">
      {/* Welcome Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-lime-700 md:text-4xl">
          Welcome Back to
        </h1>
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana Icon"
          className="mx-auto mt-2 w-20 h-20 md:w-32 md:h-32"
        />
        <h1 className="font-sans text-2xl font-bold text-lime-700 md:text-2xl">
          Digital Tumana
        </h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-lime-700 text-center mb-4">
          Login to Your Account
        </h2>

        {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4 font-medium">{message}</p>}

        <div className="space-y-4">
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
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-lime-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-lg cursor-pointer"
          >
            Login
          </button>
        </div>
      </form>

      {/* Redirect to Register */}
      <p className="mt-4 text-lg text-gray-700">
        Don't have an account?{" "}
        <Link to="/register" className="text-lime-700 font-bold hover:underline">
          Create one.
        </Link>
      </p>
    </div>
  );
};

export default Login;