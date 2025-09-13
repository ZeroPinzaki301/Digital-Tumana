import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import geoData from "../data/ph-geodata.json";

const SellerAddressPage = () => {
  const [address, setAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    region: "",
    province: "",
    cityOrMunicipality: "",
    barangay: "",
    street: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    email: "",
    telephone: ""
  });
  
  const [regionList, setRegionList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [municipalityList, setMunicipalityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch user data
        const userRes = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);
        
        // Prefill form with user data
        setFormData(prev => ({
          ...prev,
          email: userRes.data.email || "",
          telephone: userRes.data.phoneNumber || ""
        }));

        // Fetch address data
        try {
          const addressRes = await axiosInstance.get("/api/sellers/address", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (addressRes.data.address) {
            setAddress(addressRes.data.address);
            setFormData(prev => ({
              ...prev,
              ...addressRes.data.address,
              // Don't override email and telephone from user data
              email: userRes.data.email || addressRes.data.address.email || "",
              telephone: userRes.data.phoneNumber || addressRes.data.address.telephone || ""
            }));
          }
        } catch (addressErr) {
          // If we get a 404, it means no address exists yet (which is fine)
          if (addressErr.response?.status !== 404) {
            console.error("Error fetching address:", addressErr);
          }
        }
        
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();

    // Load region list from geoData
    const regions = Object.entries(geoData).map(([code, region]) => ({
      code,
      name: region.region_name
    }));
    setRegionList(regions);
  }, []);

  // Update province list when region changes
  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    if (selectedRegion) {
      const provinces = Object.keys(selectedRegion.province_list);
      setProvinceList(provinces);
      // Reset dependent fields when region changes
      setFormData(prev => ({ 
        ...prev, 
        province: "", 
        cityOrMunicipality: "", 
        barangay: "" 
      }));
    }
  }, [formData.region]);

  // Update municipality list when province changes
  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    const selectedProvince = selectedRegion?.province_list?.[formData.province];
    if (selectedProvince) {
      const municipalities = Object.keys(selectedProvince.municipality_list);
      setMunicipalityList(municipalities);
      // Reset dependent fields when province changes
      setFormData(prev => ({ 
        ...prev, 
        cityOrMunicipality: "", 
        barangay: "" 
      }));
    }
  }, [formData.province]);

  // Update barangay list when municipality changes
  useEffect(() => {
    const selectedRegion = Object.values(geoData).find(r => r.region_name === formData.region);
    const selectedProvince = selectedRegion?.province_list?.[formData.province];
    const selectedMunicipality = selectedProvince?.municipality_list?.[formData.cityOrMunicipality];
    if (selectedMunicipality) {
      setBarangayList(selectedMunicipality.barangay_list);
      // Reset barangay when municipality changes
      setFormData(prev => ({ ...prev, barangay: "" }));
    }
  }, [formData.cityOrMunicipality]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const token = localStorage.getItem("token");
    setError("");

    try {
      // First try to check if an address exists
      let addressExists = false;
      
      try {
        const checkRes = await axiosInstance.get("/api/sellers/address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        addressExists = !!checkRes.data.address;
      } catch (checkErr) {
        // If we get a 404, no address exists
        addressExists = checkErr.response?.status !== 404;
      }

      const method = addressExists ? "put" : "post";
      const res = await axiosInstance[method]("/api/sellers/address", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error("Failed to update address:", err);
      setError(err.response?.data?.message || "Failed to save address. Please try again.");
    }
  };

  // Function to format text with proper capitalization
  const formatText = (text) => {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4 relative">
      <button
        onClick={() => navigate("/seller-dashboard")}
        className="absolute top-4 left-4 py-2 px-4 bg-gray-200 text-lime-700 rounded-lg hover:bg-gray-300 transition cursor-pointer mt-3"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-md border border-lime-700">
        <h2 className="text-2xl font-bold text-lime-700 mb-6 text-center">Seller Address</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {address && !isEditing ? (
          <div className="space-y-3 text-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-lime-800">Current Address</h3>
            <p><strong>Region:</strong> {address.region}</p>
            <p><strong>Province:</strong> {address.province}</p>
            <p><strong>City/Municipality:</strong> {address.cityOrMunicipality}</p>
            <p><strong>Barangay:</strong> {address.barangay}</p>
            <p><strong>Street:</strong> {address.street}</p>
            <p><strong>Postal Code:</strong> {address.postalCode}</p>
            <p><strong>Email:</strong> {address.email}</p>
            <p><strong>Telephone:</strong> {address.telephone}</p>
            {address.latitude && address.longitude && (
              <p><strong>Location:</strong> {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}</p>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 w-full py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-500/75 hover:text-sky-900 transition cursor-pointer"
            >
              Edit Address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Region</label>
                <select 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange} 
                  required 
                  className={inputClass}
                >
                  <option value="">Select Region</option>
                  {regionList.map((r) => (
                    <option key={r.code} value={r.name}>{formatText(r.name)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Province</label>
                <select 
                  name="province" 
                  value={formData.province} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.region}
                  className={inputClass}
                >
                  <option value="">Select Province</option>
                  {provinceList.map((p) => (
                    <option key={p} value={p}>{formatText(p)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>City/Municipality</label>
                <select 
                  name="cityOrMunicipality" 
                  value={formData.cityOrMunicipality} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.province}
                  className={inputClass}
                >
                  <option value="">Select Municipality</option>
                  {municipalityList.map((m) => (
                    <option key={m} value={m}>{formatText(m)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Barangay</label>
                <select 
                  name="barangay" 
                  value={formData.barangay} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.cityOrMunicipality}
                  className={inputClass}
                >
                  <option value="">Select Barangay</option>
                  {barangayList.map((b) => (
                    <option key={b} value={b}>{formatText(b)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Street</label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.street || ""} 
                  onChange={handleChange} 
                  placeholder="Street" 
                  required 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Postal Code</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  value={formData.postalCode || ""} 
                  onChange={handleChange} 
                  placeholder="Postal Code" 
                  required 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ""} 
                  onChange={handleChange} 
                  placeholder="Email" 
                  required 
                  className={inputClass} 
                />
                {userData?.email && formData.email === userData.email && (
                  <p className="text-xs text-gray-500 mt-1">Prefilled from your account</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Telephone</label>
                <input 
                  type="tel" 
                  name="telephone" 
                  value={formData.telephone || ""} 
                  onChange={handleChange} 
                  placeholder="Telephone" 
                  required 
                  className={inputClass} 
                />
                {userData?.phoneNumber && formData.telephone === userData.phoneNumber && (
                  <p className="text-xs text-gray-500 mt-1">Prefilled from your account</p>
                )}
              </div>
            </div>

            <div className="bg-lime-50 p-4 rounded-md">
              <label className="block text-sm font-medium text-lime-800 mb-2">Location Coordinates</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm text-lime-700">Latitude</label>
                  <input 
                    type="text" 
                    name="latitude" 
                    value={formData.latitude || ""} 
                    readOnly 
                    className="w-full p-2 border border-gray-300 rounded-md bg-lime-100" 
                    placeholder="Latitude" 
                  />
                </div>
                <div>
                  <label className="text-sm text-lime-700">Longitude</label>
                  <input 
                    type="text" 
                    name="longitude" 
                    value={formData.longitude || ""} 
                    readOnly 
                    className="w-full p-2 border border-gray-300 rounded-md bg-lime-100" 
                    placeholder="Longitude" 
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleLocation}
                className="w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition cursor-pointer"
              >
                Use My Location
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex-1 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-500/75 hover:text-sky-900 transition cursor-pointer"
              >
                {address ? "Update Address" : "Add Address"}
              </button>
              
              {address && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                  }}
                  className="flex-1 py-2 bg-gray-200 text-lime-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerAddressPage;