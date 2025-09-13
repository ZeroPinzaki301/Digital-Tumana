import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import geoData from '../data/ph-geodata.json';

const AdminCreateKaritonRider = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    province: '',
    municipality: '',
    barangay: '',
    street: '',
    houseNo: '',
    email: '',
    facebookLink: ''
  });

  const [provinceList, setProvinceList] = useState([]);
  const [municipalityList, setMunicipalityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationStatus, setValidationStatus] = useState(null); // null, 'success', or 'error'
  const [existingRider, setExistingRider] = useState(null);

  useEffect(() => {
    // Get all provinces from all regions
    const allProvinces = [];
    Object.values(geoData).forEach(region => {
      Object.keys(region.province_list).forEach(province => {
        allProvinces.push(province);
      });
    });
    setProvinceList(allProvinces.sort());
  }, []);

  useEffect(() => {
    // Find the province in any region
    let selectedProvinceData = null;
    for (const region of Object.values(geoData)) {
      if (region.province_list[formData.province]) {
        selectedProvinceData = region.province_list[formData.province];
        break;
      }
    }
    
    if (selectedProvinceData) {
      const municipalities = Object.keys(selectedProvinceData.municipality_list);
      setMunicipalityList(municipalities);
      setFormData(prev => ({ ...prev, municipality: "", barangay: "" }));
    }
  }, [formData.province]);

  useEffect(() => {
    // Find the municipality in any province
    let selectedMunicipalityData = null;
    for (const region of Object.values(geoData)) {
      for (const provinceName in region.province_list) {
        const province = region.province_list[provinceName];
        if (province.municipality_list[formData.municipality]) {
          selectedMunicipalityData = province.municipality_list[formData.municipality];
          break;
        }
      }
      if (selectedMunicipalityData) break;
    }
    
    if (selectedMunicipalityData) {
      setBarangayList(selectedMunicipalityData.barangay_list);
      setFormData(prev => ({ ...prev, barangay: "" }));
    }
  }, [formData.municipality]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Reset validation status if user changes any field
    if (validationStatus) {
      setValidationStatus(null);
      setErrorMsg('');
      setExistingRider(null);
    }
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  // Validate rider before submission
  const handleValidation = async () => {
    setValidating(true);
    setErrorMsg('');
    setValidationStatus(null);
    setExistingRider(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.post('/api/kariton/validate', {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        birthdate: formData.birthdate,
        email: formData.email
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.exists) {
        setValidationStatus('error');
        setErrorMsg(response.data.message);
        setExistingRider(response.data.rider);
      } else {
        setValidationStatus('success');
      }
    } catch (err) {
      console.error('Validation failed:', err);
      setValidationStatus('error');
      setErrorMsg('Validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  // Submit the form after validation passes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validationStatus !== 'success') {
      setErrorMsg('Please validate the rider information first.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    const token = localStorage.getItem('adminToken');
    const formPayload = new FormData();
    
    // Add all form data
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });
    
    // Add profile picture if selected
    if (profilePicture) {
      formPayload.append('profilePicture', profilePicture);
    }

    try {
      const response = await axiosInstance.post('/api/kariton', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect to vehicle registration page with the new rider's ID
      navigate(`/admin/kariton/vehicle/${response.data._id}`);
    } catch (err) {
      console.error('Kariton Rider creation failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create rider');
    } finally {
      setLoading(false);
    }
  };

  // Function to format text with proper capitalization
  const formatText = (text) => {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Create Kariton Rider</h2>
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['firstName', 'middleName', 'lastName', 'birthdate', 'email', 'facebookLink'].map(field => (
            <div key={field}>
              <label className="block font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type={field === 'birthdate' ? 'date' : 'text'}
                name={field}
                required={['firstName','middleName','lastName','birthdate','email'].includes(field)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[field]}
                onChange={handleChange}
                disabled={validationStatus === 'success'}
              />
            </div>
          ))}

          {/* Address Section */}
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Province</label>
                <select 
                  name="province" 
                  required 
                  value={formData.province} 
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={validationStatus === 'success'}
                >
                  <option value="">Select Province</option>
                  {provinceList.map((p) => (
                    <option key={p} value={p}>{formatText(p)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Municipality/City</label>
                <select 
                  name="municipality" 
                  required 
                  value={formData.municipality} 
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={validationStatus === 'success' || !formData.province}
                >
                  <option value="">Select Municipality</option>
                  {municipalityList.map((m) => (
                    <option key={m} value={m}>{formatText(m)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Barangay</label>
                <select 
                  name="barangay" 
                  required 
                  value={formData.barangay} 
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={validationStatus === 'success' || !formData.municipality}
                >
                  <option value="">Select Barangay</option>
                  {barangayList.map((b) => (
                    <option key={b} value={b}>{formatText(b)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Street</label>
                <input
                  type="text"
                  name="street"
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={validationStatus === 'success'}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">House No</label>
                <input
                  type="text"
                  name="houseNo"
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.houseNo}
                  onChange={handleChange}
                  disabled={validationStatus === 'success'}
                />
              </div>
            </div>
          </div>

          {/* Validation Button */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleValidation}
              disabled={validating || validationStatus === 'success'}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {validating ? 'Validating...' : 'Validate Rider'}
            </button>
          </div>

          {/* Validation Result */}
          {validationStatus && (
            <div className={`p-4 rounded-lg border ${
              validationStatus === 'success' 
                ? 'bg-green-100 border-green-300 text-green-700' 
                : 'bg-red-100 border-red-300 text-red-700'
            }`}>
              <div className="flex items-center">
                {validationStatus === 'success' ? (
                  <FaCheckCircle className="text-green-500 mr-2" />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-2" />
                )}
                <span className="font-semibold">
                  {validationStatus === 'success' 
                    ? 'Validation successful! You can create this rider account.' 
                    : 'Validation failed!'}
                </span>
              </div>
              
              {validationStatus === 'error' && errorMsg && (
                <p className="mt-2">{errorMsg}</p>
              )}
              
              {validationStatus === 'error' && existingRider && (
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <p className="font-medium">Existing Rider Details:</p>
                  <p>Name: {existingRider.firstName} {existingRider.middleName || ''} {existingRider.lastName}</p>
                  <p>Email: {existingRider.email}</p>
                  {existingRider.birthdate && (
                    <p>Birthdate: {new Date(existingRider.birthdate).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Picture (only shown after successful validation) */}
          {validationStatus === 'success' && (
            <div>
              <label className="block font-medium mb-1">Profile Picture</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full border px-3 py-2 rounded" 
              />
              {profilePicture && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <FaCloudUploadAlt />
                  {profilePicture.name}
                </p>
              )}
            </div>
          )}

          {/* Create Button (only shown after successful validation) */}
          {validationStatus === 'success' && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Rider...' : 'Create Rider Account'}
            </button>
          )}

          {/* Edit Information Button (only shown after successful validation) */}
          {validationStatus === 'success' && (
            <button
              type="button"
              onClick={() => {
                setValidationStatus(null);
                setErrorMsg('');
                setExistingRider(null);
              }}
              className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 mt-2"
            >
              Edit Information
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminCreateKaritonRider;