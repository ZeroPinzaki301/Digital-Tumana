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
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-white px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-white cursor-pointer text-lime-700 border border-lime-700 px-4 py-2 rounded-lg shadow hover:bg-lime-100 transition"
      >
        ← Back
      </button>

      {/* Welcome Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-lime-700 md:text-4xl">
          Kariton Rider Login
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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-lime-700 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-bold text-lime-700 text-center mb-4">
          Enter Your Login Code
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
        )}

        <input
          type="text"
          name="loginCode"
          value={loginCode}
          onChange={handleChange}
          required
          placeholder="LOGIN CODE"
          maxLength={8}
          className="w-full px-4 py-3 text-center text-xl tracking-widest uppercase border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 mb-4"
        />

        <button
          type="submit"
          className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition cursor-pointer text-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default KaritonServiceLogin;