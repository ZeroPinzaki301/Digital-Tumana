import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const AdminPendingWithdrawal = () => {
  const { sellerId } = useParams();
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPendingWithdrawal = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const { data } = await axiosInstance.get(
          `/api/admin/seller-balance/withdrawal/${sellerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pending = data.data?.[0];
        setPendingWithdrawal(pending || null);
      } catch (err) {
        setError('Failed to fetch pending withdrawal.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWithdrawal();
  }, [sellerId]);

  const handleApprove = async () => {
    if (!pendingWithdrawal) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.put(
        `/api/admin/seller-balance/withdrawal/${pendingWithdrawal._id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Withdrawal approved and balance updated.');
      setPendingWithdrawal(null);
    } catch (err) {
      setError('Failed to approve withdrawal.');
    } finally {
      setActionLoading(false);
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <p className="text-gray-600">Loading pending withdrawal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-600 mb-2">Success</h2>
          <p className="text-gray-700 mb-4">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin: Pending Withdrawal</h2>

        {!pendingWithdrawal ? (
          <p className="text-gray-600">No pending withdrawal found for this seller.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700"><strong>Bank Number:</strong> {pendingWithdrawal.bankNumber}</p>
            <p className="text-gray-700"><strong>Amount:</strong> ₱{pendingWithdrawal.withdrawalAmount.toLocaleString()}</p>
            <p className="text-gray-700"><strong>Requested At:</strong> {new Date(pendingWithdrawal.createdAt).toLocaleString()}</p>
            <p className="text-yellow-700 font-semibold mt-2">Status: Pending</p>

            <button
              className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowModal(true)}
            >
              Approve Withdrawal
            </button>
          </div>
        )}
      </div>

      {/* ✅ Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Approval</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to approve this withdrawal? This will deduct ₱{pendingWithdrawal.withdrawalAmount.toLocaleString()} from the seller's balance.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingWithdrawal;