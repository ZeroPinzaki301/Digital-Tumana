import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SellerBalanceOverview = () => {
  const [balance, setBalance] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalanceAndHistory = async () => {
      try {
        const token = localStorage.getItem('token');

        const [balanceRes, historyRes] = await Promise.all([
          axiosInstance.get('/api/seller-balance', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axiosInstance.get('/api/seller-balance/withdraw/history', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setBalance(balanceRes.data.data);
        setWithdrawals(historyRes.data.data || []);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceAndHistory();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading balance...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen text-red-600 flex items-center justify-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📌 Left: Seller Balance */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Your Seller Balance
            </h1>

            {balance ? (
              <>
                <p className="text-gray-700 text-lg mb-2">
                  <strong>Available Balance:</strong>{' '}
                  ₱{balance.currentBalance.toFixed(2)}
                </p>
                <p className="text-gray-700 text-lg mb-6">
                  <strong>Bank Number:</strong>{' '}
                  {balance.bankNumber || 'Not assigned'}
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/seller-balance/withdraw')}
                    className="px-4 py-2 bg-lime-500 cursor-pointer hover:bg-lime-600 text-white rounded-lg shadow transition"
                  >
                    Withdraw Funds
                  </button>

                  <button
                    onClick={() => navigate('/seller-dashboard')}
                    className="px-4 py-2 bg-lime-700 cursor-pointer
                     hover:bg-lime-800 text-white rounded-lg shadow transition"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  You don't have a balance system yet. To enable tracking of
                  your earnings, create your Seller Balance.
                </p>
                <button
                  onClick={() => navigate('/seller-balance/create')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
                >
                  📘 View Balance Terms & Create
                </button>
              </>
            )}
          </div>
        </div>

        {/* 📌 Right: Withdrawal History */}
        <div className="bg-white shadow-lg rounded-xl p-6 overflow-y-auto max-h-[600px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Withdrawal History
          </h2>

          {withdrawals.length > 0 ? (
            <ul className="space-y-3">
              {withdrawals.map((item) => (
                <li
                  key={item._id}
                  className="bg-gray-100 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">
                      ₱{item.withdrawalAmount.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        item.status === 'approved'
                          ? 'bg-green-200 text-green-800'
                          : item.status === 'rejected'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No withdrawal history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBalanceOverview;