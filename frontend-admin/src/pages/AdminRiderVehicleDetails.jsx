import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaCloudUploadAlt, FaPlus, FaTrash, FaEdit, FaCar, FaExclamationTriangle } from 'react-icons/fa';

const AdminRiderVehicleDetails = () => {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [riderInfo, setRiderInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleType: '',
    plateNumber: '',
    plateNumberImage: null,
    vehicleImages: []
  });
  const [uploading, setUploading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatePlateNumber, setDuplicatePlateNumber] = useState('');

  useEffect(() => {
    fetchRiderAndVehicles();
  }, [riderId]);

  const fetchRiderAndVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Fetch rider info
      const riderResponse = await axiosInstance.get(`/api/kariton/${riderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiderInfo(riderResponse.data);
      
      // Fetch vehicle details using the new endpoint
      try {
        const vehicleResponse = await axiosInstance.get(`/api/kariton/vehicle/rider/${riderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle the array response and extract all vehicles
        if (Array.isArray(vehicleResponse.data)) {
          // Extract all vehicles from all documents into a single array
          const allVehicles = vehicleResponse.data.flatMap(doc => doc.vehicles || []);
          setVehicles(allVehicles);
        } else if (vehicleResponse.data.vehicles) {
          // Fallback for old format (single object with vehicles array)
          setVehicles(vehicleResponse.data.vehicles);
        } else {
          setVehicles([]);
        }
      } catch (vehicleErr) {
        // If it's a 404 error, just set empty vehicles (no vehicles found)
        if (vehicleErr.response?.status === 404) {
          setVehicles([]);
        } else {
          throw vehicleErr; // Re-throw other errors
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorMsg('Failed to load rider and vehicle information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName, isMultiple = false) => {
    const files = e.target.files;
    if (isMultiple) {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: [...prev[fieldName], ...Array.from(files)] 
      }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: files[0] }));
    }
  };

  const removeImage = (index, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('adminToken');
      const formPayload = new FormData();
      
      // Add vehicle data
      formPayload.append('riderId', riderId);
      formPayload.append('vehicleName', formData.vehicleName);
      formPayload.append('vehicleType', formData.vehicleType);
      formPayload.append('plateNumber', formData.plateNumber);
      
      // Add plate number image
      if (formData.plateNumberImage) {
        formPayload.append('plateNumberImage', formData.plateNumberImage);
      }
      
      // Add vehicle images
      formData.vehicleImages.forEach((image, index) => {
        formPayload.append(`vehicleImages`, image);
      });

      let response;
      if (editingVehicle) {
        // Update existing vehicle
        response = await axiosInstance.put(
          `/api/kariton/vehicle/${editingVehicle._id}`,
          formPayload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccessMsg('Vehicle updated successfully!');
      } else {
        // Add new vehicle
        response = await axiosInstance.post(
          '/api/kariton/vehicle',
          formPayload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccessMsg('Vehicle added successfully!');
      }

      // Reset form and refresh data
      setFormData({
        vehicleName: '',
        vehicleType: '',
        plateNumber: '',
        plateNumberImage: null,
        vehicleImages: []
      });
      setShowAddForm(false);
      setEditingVehicle(null);
      fetchRiderAndVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      
      // Check if it's a duplicate plate number error
      if (err.response?.data?.error?.includes('duplicate key error') && 
          err.response?.data?.error?.includes('plateNumber')) {
        // Extract the duplicate plate number from the error message
        const match = err.response.data.error.match(/plateNumber: "([^"]+)"/);
        const plateNum = match ? match[1] : formData.plateNumber;
        
        setDuplicatePlateNumber(plateNum);
        setShowDuplicateModal(true);
        setErrorMsg(`Plate number "${plateNum}" already exists in the system.`);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to save vehicle details');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleName: vehicle.vehicleName,
      vehicleType: vehicle.vehicleType,
      plateNumber: vehicle.plateNumber,
      plateNumberImage: null, // Reset file input
      vehicleImages: [] // Reset file inputs
    });
    setShowAddForm(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/kariton/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMsg('Vehicle deleted successfully!');
      fetchRiderAndVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setErrorMsg('Failed to delete vehicle');
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingVehicle(null);
    setFormData({
      vehicleName: '',
      vehicleType: '',
      plateNumber: '',
      plateNumberImage: null,
      vehicleImages: []
    });
  };

  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicatePlateNumber('');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rider information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Vehicle Management</h2>
            {riderInfo && (
              <p className="text-gray-600">
                For rider: {riderInfo.firstName} {riderInfo.middleName} {riderInfo.lastName}
              </p>
            )}
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex items-start">
            <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {successMsg}
          </div>
        )}

        {/* Add Vehicle Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Add Vehicle
            </button>
          </div>
        )}

        {/* Vehicle Form */}
        {showAddForm && (
          <div className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Vehicle Name</label>
                <input
                  type="text"
                  name="vehicleName"
                  required
                  value={formData.vehicleName}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vehicle name (e.g., Honda Civic)"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Vehicle Type</label>
                <select
                  name="vehicleType"
                  required
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="2 wheels">2 wheels</option>
                  <option value="3 wheels">3 wheels</option>
                  <option value="4 wheels">4 wheels</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Plate Number</label>
                <input
                  type="text"
                  name="plateNumber"
                  required
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plate number"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Plate Number Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'plateNumberImage')}
                  className="w-full border px-3 py-2 rounded"
                />
                {formData.plateNumberImage && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <FaCloudUploadAlt />
                    {formData.plateNumberImage.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">Vehicle Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'vehicleImages', true)}
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="mt-2">
                  {formData.vehicleImages.map((image, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded mb-1">
                      <span className="text-sm flex items-center gap-1">
                        <FaCloudUploadAlt />
                        {image.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index, 'vehicleImages')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Registered Vehicles</h3>
          
          {vehicles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">This rider currently has no vehicle data</p>
              <p className="text-gray-400 text-sm">Click the "Add Vehicle" button above to register a vehicle</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle._id || index} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-blue-600">{vehicle.vehicleName}</h4>
                      <p className="text-sm text-gray-500">{vehicle.vehicleType}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <p className="mb-2">
                    <span className="font-medium">Plate Number:</span> {vehicle.plateNumber}
                  </p>
                  
                  {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Vehicle Images:</p>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.vehicleImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Vehicle ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {vehicle.plateNumberImage && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Plate Number Image:</p>
                      <img
                        src={vehicle.plateNumberImage}
                        alt="Plate number"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Plate Number Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Duplicate Plate Number</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              The plate number <span className="font-semibold">"{duplicatePlateNumber}"</span> is already registered in the system. 
              Please use a different plate number.
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={closeDuplicateModal}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiderVehicleDetails;
