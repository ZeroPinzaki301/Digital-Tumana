import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const types = [
  "All Types",
  "Fresh Produce",
  "Grains & Seeds",
  "Fertilizers",
  "Agri Chemicals",
  "Animal Feed",
  "Tools & Equipment",
  "Nursery Plants",
  "Compost & Soil"
];

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [customerStatus, setCustomerStatus] = useState("loading");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await axiosInstance.get("/api/products");
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to load products:", err);
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/customers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0"
          },
          params: { t: Date.now() }
        });
        setCustomerStatus("verified");
      } catch (err) {
        const code = err.response?.status;
        if (code === 403) {
          setCustomerStatus("pending");
        } else if (code === 404) {
          setCustomerStatus("none");
        } else {
          console.error("Error fetching customer status:", err);
          setCustomerStatus("none");
        }
      }
    };

    fetchMarketplace();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const nameMatches = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatches = selectedType === "All Types" || product.type === selectedType;
      const price = product.pricePerUnit;
      const withinMin = minPrice === "" || price >= parseFloat(minPrice);
      const withinMax = maxPrice === "" || price <= parseFloat(maxPrice);
      return nameMatches && typeMatches && withinMin && withinMax;
    })
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-orange-50">
      <h2 className="text-3xl font-bold text-orange-800 mb-6 text-center pt-10">Tumana Market</h2>
      {/* Fixed Sidebar */}
      <aside className="fixed top-41 left-4 w-64 bg-white border border-orange-300 rounded-lg shadow-md p-4 h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-lg font-bold text-orange-800 mb-4">Filters</h2>

        <input
          type="text"
          placeholder="🔍 Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        <label className="text-sm font-semibold text-orange-700 mb-2 block">Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <label className="text-sm font-semibold text-orange-700 mb-2 block">Price Range (₱):</label>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="mt-6">
          {customerStatus === "loading" ? (
            <p className="text-sm text-gray-500">Checking status...</p>
          ) : (
            <button
              onClick={() => {
                if (customerStatus === "none") {
                  navigate("/customer/register");
                }
              }}
              className={`w-full py-2 font-medium rounded transition ${
                customerStatus === "none"
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : customerStatus === "pending"
                  ? "bg-yellow-400 text-yellow-900 cursor-default"
                  : "bg-green-500 text-white cursor-default"
              }`}
            >
              {customerStatus === "none"
                ? "Be a Customer"
                : customerStatus === "pending"
                ? "Pending Registration"
                : "Verified"}
            </button>
          )}
        </div>

        <div className="mt-8 border-t pt-4">
          <button
            onClick={() => navigate("/my-cart")}
            className="w-full py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            <span>🧺</span>
            <span>View My Cart</span>
          </button>
        </div>
      </aside>

      {/* Main Content with proper spacing */}
      <main className="pl-[272px] pr-4 ml-2">

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">No matching products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-orange-300 rounded-lg shadow hover:shadow-md transition duration-200 overflow-hidden"
              >
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-bold text-orange-800">{product.productName}</h3>
                  <p className="text-sm text-gray-700">₱{product.pricePerUnit} / {product.unitType}</p>
                  <p className="text-xs text-gray-500">{product.type} • Stock: {product.stock}</p>
                  <button
                    onClick={() => navigate(`/marketplace/${product._id}`)}
                    className="mt-3 w-full py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;