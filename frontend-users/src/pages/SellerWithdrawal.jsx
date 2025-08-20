import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SellerWithdrawal = () => {
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const [balance, setBalance] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Check for pending withdrawal
        const pendingRes = await axiosInstance.get('/api/seller-balance/withdraw/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (pendingRes.data.data) {
          setPendingWithdrawal(pendingRes.data.data);
        } else {
          // If no pending, fetch balance
          const balanceRes = await axiosInstance.get('/api/seller-balance', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBalance(balanceRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMaxClick = () => {
    if (balance) {
      setWithdrawalAmount(balance.currentBalance.toString());
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setWithdrawalAmount('');
      return;
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) return;
    if (balance && amount > balance.currentBalance) {
      setWithdrawalAmount(balance.currentBalance.toString());
    } else {
      setWithdrawalAmount(value);
    }
  };

  const handleWithdraw = async () => {
    setError('');
    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0 || (balance && amount > balance.currentBalance)) {
      setError('Invalid amount. Must be greater than 0 and not exceed your current balance.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/api/seller-balance/withdraw', {
        withdrawalAmount: amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen text-red-600 flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center relative">

      {/* ✅ Back Button fixed at upper left corner */}
      <button
        onClick={() => navigate('/seller-balance')}
        className="absolute cursor-pointer border border-lime-700 top-6 left-6 px-4 py-2 bg-white hover:bg-lime-100 text-gray-700 rounded-lg shadow"
      >
        ← Back
      </button>

      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Withdraw Funds</h1>

        {pendingWithdrawal ? (
          <>
            <p className="text-gray-700 mb-4">
              You currently have a <strong>pending withdrawal</strong> request. Please wait until it's processed before submitting another.
            </p>
            <button
              onClick={() => navigate('/seller-balance')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              ← Back to Balance Overview
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-2">
              <strong>Available Balance:</strong> ₱{balance?.currentBalance.toFixed(2)}
            </p>
            <div className="relative mb-2">
              <input
                type="number"
                value={withdrawalAmount}
                onChange={handleAmountChange}
                placeholder="Enter amount to withdraw"
                className="w-full px-4 py-2 border rounded pr-16"
                min="1"
                max={balance?.currentBalance}
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                Max
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
            >
              Submit Withdrawal
            </button>
          </>
        )}
      </div>

      {/* ✅ Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700">Withdrawal Request Submitted</h2>
            <p className="text-gray-700 mb-4">Your withdrawal request has been successfully submitted and is now pending approval.</p>
            <button
              onClick={() => navigate('/seller-balance')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              ← Back to Balance Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerWithdrawal;