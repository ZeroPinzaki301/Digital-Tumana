import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const WorkerAddressPage = () => {
  const [address, setAddress] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/workers/address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddress(res.data.address);
        setFormData(res.data.address);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchAddress();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const method = address ? "put" : "post";
      await axiosInstance;
      setIsEditing(false);
      navigate(0);
    } catch (err) {
      console.error("Failed to update address:", err);
    }
  };

  const buttonBase = "w-full py-2 rounded-lg transition cursor-pointer";
  const buttonPrimary = buttonBase + " bg-lime-600 text-white hover:bg-lime-500/75 hover:text-sky-900";
  const buttonSecondary = buttonBase + " bg-sky-900 text-white hover:bg-sky-800";
  const buttonCancel = buttonBase + " bg-gray-200 text-lime-700 hover:bg-gray-300";

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4 relative">
      {/* ✅ Fixed: Added relative to parent container */}
      <button
        onClick={() => navigate("/worker-dashboard")}
        className="absolute top-4 left-4 py-2 px-4 bg-gray-200 text-lime-700 rounded-lg hover:bg-gray-300 transition cursor-pointer mt-3"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-md border border-lime-700">
        <h2 className="text-2xl font-bold text-lime-700 mb-4 text-center">Worker Address</h2>

        {address && !isEditing ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Region:</strong> {address.region}</p>
            <p><strong>Province:</strong> {address.province}</p>
            <p><strong>City:</strong> {address.cityOrMunicipality}</p>
            <p><strong>Barangay:</strong> {address.barangay}</p>
            <p><strong>Street:</strong> {address.street}</p>
            <p><strong>Postal Code:</strong> {address.postalCode}</p>
            <p><strong>Email:</strong> {address.email}</p>
            <p><strong>Telephone:</strong> {address.telephone}</p>
            <button onClick={() => setIsEditing(true)} className={buttonPrimary}>
              Edit Address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="region" value={formData.region || ""} onChange={handleChange} placeholder="Region" required className="input" />
            <input type="text" name="province" value={formData.province || ""} onChange={handleChange} placeholder="Province" required className="input" />
            <input type="text" name="cityOrMunicipality" value={formData.cityOrMunicipality || ""} onChange={handleChange} placeholder="City/Municipality" required className="input" />
            <input type="text" name="barangay" value={formData.barangay || ""} onChange={handleChange} placeholder="Barangay" required className="input" />
            <input type="text" name="street" value={formData.street || ""} onChange={handleChange} placeholder="Street" required className="input" />
            <input type="text" name="postalCode" value={formData.postalCode || ""} onChange={handleChange} placeholder="Postal Code" required className="input" />
            <input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" required className="input" />
            <input type="tel" name="telephone" value={formData.telephone || ""} onChange={handleChange} placeholder="Telephone" required className="input" />

            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      }));
                    },
                    (error) => {
                      console.error("Location error:", error);
                      alert("Unable to fetch your location. Please check browser permissions.");
                    }
                  );
                } else {
                  alert("Geolocation is not supported by your browser.");
                }
              }}
              className={buttonSecondary}
            >
              Use My Location
            </button>

            <button type="submit" className={buttonPrimary}>
              {address ? "Update Address" : "Add Address"}
            </button>

            {address && (
              <button type="button" onClick={() => setIsEditing(false)} className={buttonCancel}>
                Cancel
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default WorkerAddressPage;
