import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import geoData from "../data/ph-geodata.json";

const idTypes = ["National ID", "Passport", "Driver's License"];
// Added secondIdTypes with the expanded options
const secondIdTypes = [
  "National ID", 
  "Passport", 
  "Driver's License", 
  "PhilHealth ID", 
  "UMID", 
  "SSS ID", 
  "Barangay ID", 
  "Postal ID", 
  "Voter's ID", 
  "Senior Citizen ID", 
  "PRC ID", 
  "Company ID", 
  "School ID", 
  "TIN ID"
];

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
    secondIdType: "", // Added secondIdType field
    secondIdImage: null,
    agreedToPolicy: false
  });

  const [regionList, setRegionList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [municipalityList, setMunicipalityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUser(res.data);
        
        // Pre-fill form with user data
        const { firstName, middleName, lastName, email, phoneNumber } = res.data;
        const fullName = middleName 
          ? `${firstName} ${middleName} ${lastName}` 
          : `${firstName} ${lastName}`;
          
        setFormData(prev => ({
          ...prev,
          fullName,
          email,
          telephone: phoneNumber
        }));
      } catch {
        navigate("/login");
      }
    };
    fetchUser();

    const regions = Object.entries(geoData).map(([code, region]) => ({
      code,
      name: region.region_name
    }));
    setRegionList(regions);
  }, [navigate]);

  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    if (selectedRegion) {
      const provinces = Object.keys(selectedRegion.province_list);
      setProvinceList(provinces);
      setFormData(prev => ({ ...prev, province: "", cityOrMunicipality: "", barangay: "" }));
    }
  }, [formData.region]);

  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    const selectedProvince = selectedRegion?.province_list?.[formData.province];
    if (selectedProvince) {
      const municipalities = Object.keys(selectedProvince.municipality_list);
      setMunicipalityList(municipalities);
      setFormData(prev => ({ ...prev, cityOrMunicipality: "", barangay: "" }));
    }
  }, [formData.province]);

  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    const selectedProvince = selectedRegion?.province_list?.[formData.province];
    const selectedMunicipality = selectedProvince?.municipality_list?.[formData.cityOrMunicipality];
    if (selectedMunicipality) {
      setBarangayList(selectedMunicipality.barangay_list);
      setFormData(prev => ({ ...prev, barangay: "" }));
    }
  }, [formData.cityOrMunicipality]);

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
        if (value !== "" && value !== null) payload.append(key, value);
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

  const inputClass = "input cursor-pointer";
  const buttonClass = "py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-500/75 hover:text-sky-900 transition cursor-pointer";

  // Function to format text with proper capitalization
  const formatText = (text) => {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="mt-7 min-h-screen bg-orange-50 flex items-center justify-center px-4 relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-xl border border-orange-300"
      >
        <h2 className="text-2xl font-bold text-lime-900 mb-6 text-center">Customer Verification</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-lime-900 mb-1">Full Name</label>
            <input 
              name="fullName" 
              placeholder="Enter your full name" 
              required 
              value={formData.fullName} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-lime-900 mb-1">Email</label>
            <input 
              name="email" 
              placeholder="Enter your email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-lime-900 mb-1">Telephone</label>
            <input 
              name="telephone" 
              placeholder="Enter your telephone number" 
              required 
              value={formData.telephone} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-6 p-4 border border-lime-300 rounded-lg bg-lime-50">
          <h3 className="text-lg font-semibold text-lime-900 mb-4">Default Delivery Address</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Region</label>
              <select name="region" required value={formData.region} onChange={handleChange} className={inputClass}>
                <option value="">Select Region</option>
                {regionList.map((r) => (
                  <option key={r.code} value={r.name}>{formatText(r.name)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Province</label>
              <select name="province" required value={formData.province} onChange={handleChange} className={inputClass}>
                <option value="">Select Province</option>
                {provinceList.map((p) => (
                  <option key={p} value={p}>{formatText(p)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Municipality/City</label>
              <select name="cityOrMunicipality" required value={formData.cityOrMunicipality} onChange={handleChange} className={inputClass}>
                <option value="">Select Municipality</option>
                {municipalityList.map((m) => (
                  <option key={m} value={m}>{formatText(m)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Barangay</label>
              <select name="barangay" required value={formData.barangay} onChange={handleChange} className={inputClass}>
                <option value="">Select Barangay</option>
                {barangayList.map((b) => (
                  <option key={b} value={b}>{formatText(b)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Street Address</label>
              <input 
                name="street" 
                placeholder="Enter your street address" 
                required 
                value={formData.street} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-lime-900 mb-1">Postal Code</label>
              <input 
                name="postalCode" 
                placeholder="Enter postal code" 
                required 
                value={formData.postalCode} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-lime-900 block mb-2">Location Coordinates:</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-lime-700 mb-1">Latitude</label>
                <input 
                  name="latitude" 
                  value={formData.latitude} 
                  readOnly 
                  className="input bg-lime-100 cursor-pointer p-2 rounded-sm" 
                  placeholder="Latitude" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-lime-700 mb-1">Longitude</label>
                <input 
                  name="longitude" 
                  value={formData.longitude} 
                  readOnly 
                  className="input bg-lime-100 cursor-pointer p-2 rounded-sm" 
                  placeholder="Longitude" 
                />
              </div>
            </div>
          </div>

          <button type="button" onClick={handleLocation} className={buttonClass + " mt-4"}>
            Get My Location
          </button>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold text-lime-900 mb-1">Primary ID Type</label>
          <select 
            name="idType" 
            required 
            value={formData.idType} 
            onChange={handleChange} 
            className={inputClass + " border p-2.5 rounded-sm"}
          >
            <option value="">Select ID Type</option>
            {idTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold text-lime-900 mb-1">Upload Valid ID (Primary)</label>
          <label className="cursor-pointer border p-3 rounded-md">
            <input 
              type="file" 
              name="idImage" 
              onChange={handleChange} 
              required 
              className="cursor-pointer" 
            />
          </label>
        </div>

        {/* Added second ID type field */}
        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold text-lime-900 mb-1">Secondary ID Type</label>
          <select 
            name="secondIdType" 
            value={formData.secondIdType} 
            onChange={handleChange} 
            className={inputClass + " border p-2.5 rounded-sm"}
          >
            <option value="">Select Secondary ID Type (Optional)</option>
            {secondIdTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Added second ID image field */}
        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold text-lime-900 mb-1">Upload Second ID (Secondary)</label>
          <label className="cursor-pointer border p-3 rounded-md">
            <input 
              type="file" 
              name="secondIdImage" 
              onChange={handleChange} 
              className="cursor-pointer" 
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">Additional identification document</p>
        </div>

        <label className="flex items-center mt-2 mb-6 cursor-pointer">
          <input 
            type="checkbox" 
            name="agreedToPolicy" 
            checked={formData.agreedToPolicy} 
            onChange={handleChange} 
            className="mr-2 cursor-pointer" 
          />
          <span onClick={() => setShowPolicyModal(true)} className="text-lime-700 underline">
            I agree to the Customer Policy
          </span>
        </label>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded transition ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-lime-600 text-white hover:bg-lime-500/75 hover:text-sky-900 cursor-pointer"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Verification"}
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="w-full py-2 mt-2 rounded transition bg-red-600 text-white hover:bg-red-500/75 hover:text-white cursor-pointer"
        >
          Cancel
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg relative text-center border border-orange-700">
            <h3 className="text-xl font-bold text-orange-700 mb-2">Verification Submitted</h3>
            <p className="text-gray-700 mb-4">
              Thanks for submitting your info. We'll review your documents shortly. Please check your dashboard for updates.
            </p>
            <button
              onClick={() => navigate("/marketplace")}
              className={buttonClass + " w-full"}
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      )}

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
              className="mt-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 hover:text-sky-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegister;
