import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SellerBalanceCreate = () => {
  const [balanceExists, setBalanceExists] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/api/seller/balance', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.data) {
          setBalanceExists(true);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Unable to check balance status.');
        }
      }
    };

    checkBalance();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/api/seller-balance/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreated(true);
    } catch (err) {
      console.error('Error creating balance:', err);
      setError(err.response?.data?.message || 'Failed to create balance.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white shadow p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Seller Balance Policy</h1>

        <p className="text-gray-700 mb-6">
          The Seller Balance allows you to track your earnings, service credits, and payouts. We do not handle actual banking operations. By creating your balance account, you agree to allow the system to compute and show your available funds based on transactions completed inside the platform.
        </p>

        {error && (
          <p className="text-red-600 mb-4 text-sm">{error}</p>
        )}

        {created ? (
          <>
            <p className="text-green-700 mb-4 font-medium">Your balance system has been activated!</p>
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Go to Dashboard →
            </button>
          </>
        ) : balanceExists ? (
          <p className="text-gray-600">Your balance system already exists.</p>
        ) : (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            ✅ Create Balance
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerBalanceCreate;