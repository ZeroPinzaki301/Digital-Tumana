import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import axiosInstance from "../utils/axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(`/api/orders/seller/analytics?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedYear]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
    </div>
  );
  
  if (!analytics) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="text-lime-500 text-5xl mb-4">⚠️</div>
        <p className="text-gray-600">Failed to load analytics data</p>
        <button
          onClick={() => navigate('/seller-dashboard')}
          className="cursor-pointer mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Prepare monthly revenue data
  const monthlyRevenueData = Array(12).fill(0);
  analytics.monthlySales.forEach(month => {
    monthlyRevenueData[month._id - 1] = month.totalRevenue;
  });

  const monthlyData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Monthly Revenue (₱)',
        data: monthlyRevenueData,
        backgroundColor: 'rgba(132, 204, 22, 0.7)',
        borderColor: 'rgba(101, 163, 13, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Prepare top products data
  const topProductsData = {
    labels: analytics.topProducts.map(product => product.product.productName),
    datasets: [
      {
        label: 'Units Sold',
        data: analytics.topProducts.map(product => product.totalQuantity),
        backgroundColor: [
          'rgba(132, 204, 22, 0.8)',
          'rgba(101, 163, 13, 0.8)',
          'rgba(63, 98, 18, 0.8)',
          'rgba(190, 242, 100, 0.8)',
          'rgba(236, 252, 203, 0.8)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Top Selling Products'
      }
    },
  };

  // Calculate statistics from the backend data
  const { totalRevenue, totalOrders, avgOrderValue } = analytics.overallStats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/seller-dashboard')}
        className="cursor-pointer mb-6 px-4 py-2 bg-lime-700 text-white rounded-md hover:bg-lime-800 transition flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Dashboard
      </button>

      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-lime-900">Sales Analytics</h2>
        <p className="text-lime-700 mt-2">Track your sales performance and product insights</p>
      </div>

      {/* Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-center mb-8 gap-4">
        <label htmlFor="year" className="text-sm font-medium text-gray-700">
          Select Year:
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 w-full sm:w-auto"
        >
          {[2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-lime-500">
          <div className="flex items-center">
            <div className="rounded-full bg-lime-100 p-3 mr-4">
              <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₱{totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-lime-500">
          <div className="flex items-center">
            <div className="rounded-full bg-lime-100 p-3 mr-4">
              <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-lime-500">
          <div className="flex items-center">
            <div className="rounded-full bg-lime-100 p-3 mr-4">
              <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-800">₱{avgOrderValue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <Bar data={monthlyData} options={monthlyOptions} />
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <Doughnut data={topProductsData} options={doughnutOptions} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Top Products Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-lime-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-lime-800 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-lime-800 uppercase tracking-wider">
                  Units Sold
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-lime-800 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-lime-800 uppercase tracking-wider">
                  Price/Unit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topProducts.map((product, index) => (
                <tr key={product._id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={product.product.productImage} alt={product.product.productName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.product.productName}</div>
                        <div className="text-sm text-gray-500">{product.product.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.totalQuantity}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₱{product.totalRevenue.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₱{product.product.pricePerUnit.toFixed(2)}/{product.product.unitType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;