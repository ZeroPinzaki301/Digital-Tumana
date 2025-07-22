import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const idTypes = ["National ID", "Passport", "Driver's License"];

const CustomerRegister = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    region: "",
    province: "",
    cityOrMunicipality: "",
    barangay: "",
    street: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    email: "",
    telephone: "",
    idType: "",
    idImage: null,
    agreedToPolicy: false
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  // 🔐 Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUser(res.data);
      } catch {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      return alert("GPS not supported on this device");
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      },
      (err) => {
        console.error("Location error:", err);
        alert("Unable to get location. Please allow permission.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToPolicy) {
      return setError("You must agree to the customer policy before submitting.");
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") payload.append(key, value);
      });

      const res = await axiosInstance.post("/api/customers/register", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(res.data.message);
      setError("");
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-2xl w-full rounded-lg p-6 shadow-md border border-orange-300"
      >
        <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
          Customer Verification
        </h2>

        {/* 🧑 Personal Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="fullName" placeholder="Full Name" required value={formData.fullName} onChange={handleChange} className="input" />
          <input name="email" placeholder="Email" required value={formData.email} onChange={handleChange} className="input" />
          <input name="telephone" placeholder="Telephone" required value={formData.telephone} onChange={handleChange} className="input" />
          <input name="region" placeholder="Region" required value={formData.region} onChange={handleChange} className="input" />
          <input name="province" placeholder="Province" required value={formData.province} onChange={handleChange} className="input" />
          <input name="cityOrMunicipality" placeholder="City or Municipality" required value={formData.cityOrMunicipality} onChange={handleChange} className="input" />
          <input name="barangay" placeholder="Barangay" required value={formData.barangay} onChange={handleChange} className="input" />
          <input name="street" placeholder="Street" required value={formData.street} onChange={handleChange} className="input" />
          <input name="postalCode" placeholder="Postal Code" required value={formData.postalCode} onChange={handleChange} className="input" />
        </div>

        {/* 🧭 Location Section */}
        <hr className="my-4" />
        <label className="text-sm font-semibold text-orange-700 block mb-1">Location:</label>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <input name="latitude" value={formData.latitude} readOnly className="input bg-orange-100" placeholder="Latitude" />
          <input name="longitude" value={formData.longitude} readOnly className="input bg-orange-100" placeholder="Longitude" />
        </div>
        <button type="button" onClick={handleLocation} className="mb-4 py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
          📍 Get My Location
        </button>

        {/* 🧾 ID Upload */}
        <select name="idType" required value={formData.idType} onChange={handleChange} className="input mb-4">
          <option value="">Select ID Type</option>
          {idTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <label className="block mb-4">
          Upload Valid ID:{" "}
          <input type="file" name="idImage" onChange={handleChange} required />
        </label>

        {/* ✅ Policy Agreement */}
        <label className="flex items-center mt-2 mb-4">
          <input type="checkbox" name="agreedToPolicy" checked={formData.agreedToPolicy} onChange={handleChange} className="mr-2" />
          I agree to the Customer Policy
        </label>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded transition ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-700 text-white hover:bg-orange-800"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Verification"}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg relative text-center border border-orange-700">
            <h3 className="text-xl font-bold text-orange-700 mb-2">Verification Submitted</h3>
            <p className="text-gray-700 mb-4">
              Thanks for submitting your info. We’ll review your documents shortly. Please check your dashboard for updates.
            </p>
            <button
              onClick={() => navigate("/marketplace")}
              className="w-full py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegister;