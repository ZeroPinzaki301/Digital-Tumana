import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

const AdminCreateKaritonRider = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    birthdate: '',
    houseNo: '',
    street: '',
    barangay: '',
    municipality: '',
    province: '',
    email: '',
    facebookLink: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const token = localStorage.getItem('adminToken');
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });
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

      navigate('/admin/kariton-riders');
    } catch (err) {
      console.error('Kariton Rider creation failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create rider');
    } finally {
      setLoading(false);
    }
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
          {['firstName', 'lastName', 'age', 'birthdate', 'houseNo', 'street', 'barangay', 'municipality', 'province', 'email', 'facebookLink'].map(field => (
            <div key={field}>
              <label className="block font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type={field === 'age' ? 'number' : field === 'birthdate' ? 'date' : 'text'}
                name={field}
                required={['firstName','lastName','age','birthdate','houseNo','street','barangay','municipality','province','email'].includes(field)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[field]}
                onChange={handleChange}
              />
            </div>
          ))}

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

          {errorMsg && <p className="text-red-600">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
          >
            {loading ? 'Creating...' : 'Create Rider'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateKaritonRider;