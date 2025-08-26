
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
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white shadow-md p-6 sm:p-8 rounded-lg">
        <button
          onClick={() => navigate('/seller-dashboard')}
          className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Seller Balance Policy</h1>

        <div className="text-gray-700 space-y-4 mb-6">
          <p>
            The Seller Balance is a virtual wallet provided to all registered sellers on our platform. It reflects the current earnings available for withdrawal and serves as a secure and transparent way to manage seller funds.
          </p>
          <p>
            <strong>Balance Visibility:</strong> Sellers can view their current balance in real-time through their account dashboard. The balance includes all cleared earnings from completed transactions.
          </p>
          <p>
            <strong>Withdrawal Process:</strong> To withdraw funds, sellers must:
            <ol className="list-decimal list-inside mt-2">
              <li>Initiate a withdrawal request from their account.</li>
              <li>Visit the designated <strong>Digital Tumana</strong> location in person.</li>
              <li>Present valid identification and transaction reference to receive cash.</li>
            </ol>
          </p>
          <p>
            <strong>Important Notes:</strong> Withdrawals are processed only during official operating hours of the Digital Tumana. Sellers are responsible for accurate requests and must report issues within 24 hours.
          </p>
          <p>
            <strong>Policy Updates:</strong> This policy may be updated periodically. Sellers will be notified of changes via email and platform notifications.
          </p>
        </div>

        {error && (
          <p className="text-red-600 mb-4 text-sm">{error}</p>
        )}

        {created ? (
          <>
            <p className="text-green-700 mb-4 font-medium">Your balance system has been activated!</p>
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Go to Dashboard →
            </button>
          </>
        ) : balanceExists ? (
          <p className="text-gray-600">Your balance system already exists.</p>
        ) : (
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
          >
            Create Balance
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerBalanceCreate;
