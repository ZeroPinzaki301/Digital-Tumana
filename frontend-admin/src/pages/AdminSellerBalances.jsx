import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaSearch, FaMoneyCheckAlt } from "react-icons/fa";

const AdminSellerBalances = () => {
  const [balances, setBalances] = useState([]);
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axiosInstance.get("/api/admin/seller-balance", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBalances(response.data.data);
        setFilteredBalances(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load seller balances");
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  useEffect(() => {
    const results = balances.filter(balance => {
      const seller = balance.sellerId;
      return (
        seller?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredBalances(results);
  }, [searchTerm, balances]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <p className="text-gray-600">Loading seller balances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Balances</h2>
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

  if (filteredBalances.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Seller Balances</h1>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaMoneyCheckAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Seller Balances Found</h2>
            <p className="text-gray-500">
              {searchTerm ? "No matches for your search" : "No balances available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Seller Balances</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-2">Bank Number</div>
            <div className="col-span-3">Seller ID</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Balance</div>
          </div>

          {filteredBalances.map(balance => {
            const seller = balance.sellerId;
            const fullName = `${seller?.firstName || ""} ${seller?.lastName || ""}`;

            return (
              <div
                key={balance._id}
                className="grid grid-cols-12 p-4 border-b hover:bg-blue-50 cursor-pointer transition duration-150 ease-in-out"
                title="View pending withdrawal"
                onClick={() => navigate(`/admin/seller-withdrawal/${seller._id}`)}
              >
                <div className="col-span-2 text-gray-800">{balance.bankNumber}</div>
                <div className="col-span-3 text-blue-600 font-medium break-words">{seller?.userId}</div>
                <div className="col-span-3 text-gray-800 break-words">{fullName}</div>
                <div className="col-span-3 text-gray-600 break-words">{seller?.email}</div>
                <div className="col-span-1 text-green-700 font-semibold">₱{balance.currentBalance.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSellerBalances;