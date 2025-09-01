import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate } from "react-router-dom";

const KaritonServiceLogin = () => {
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    let value = e.target.value.toUpperCase().slice(0, 8);
    // Ensure only alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, '');
    setLoginCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/api/kariton/login", {
        loginCode,
      });

      const { token, _id, firstName } = response.data;

      localStorage.setItem("karitonToken", token);
      localStorage.setItem("karitonId", _id);
      localStorage.setItem("karitonFirstName", firstName);
      window.dispatchEvent(new Event("storage"));

      navigate("/kariton-service/rider/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-white px-4 py-8">
      <style>
        {`
          .login-input {
            width: 100%;
            padding: 0.75rem 1rem;
            text-align: center;
            font-size: 1.125rem;
            line-height: 1.75rem;
            border: 1px solid #4d7c0f;
            border-radius: 0.5rem;
            outline: none;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }
          @media (min-width: 640px) {
            .login-input {
              font-size: 1.25rem;
              line-height: 1.75rem;
            }
          }
          .login-input:focus {
            box-shadow: 0 0 0 3px rgba(101, 163, 13, 0.3);
          }
        `}
      </style>
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-white cursor-pointer text-lime-700 border border-lime-700 px-4 py-2 rounded-lg shadow hover:bg-lime-100 transition text-sm sm:text-base"
      >
        ← Back
      </button>

      {/* Welcome Section */}
      <div className="text-center mb-6 w-full flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-lime-700 md:text-4xl">
          Kariton Rider Login
        </h1>
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana Icon"
          className="mx-auto mt-2 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32"
        />
        <h1 className="font-sans text-xl sm:text-2xl font-bold text-lime-700 md:text-2xl">
          Digital Tumana
        </h1>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-lime-700 p-4 sm:p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-lg sm:text-xl font-bold text-lime-700 text-center mb-4">
          Enter Your Login Code
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 font-medium text-sm sm:text-base">{error}</p>
        )}

        <div className="relative">
          <input
            type="text"
            name="loginCode"
            value={loginCode}
            onChange={handleChange}
            required
            placeholder="ENTER 8-DIGIT CODE"
            maxLength={8}
            className="login-input mb-4"
          />
          <div className="absolute bottom-2 right-4 text-xs text-gray-400">
            {loginCode.length}/8
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition cursor-pointer text-base sm:text-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default KaritonServiceLogin;
