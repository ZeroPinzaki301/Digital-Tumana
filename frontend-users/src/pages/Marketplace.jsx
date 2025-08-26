import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import publicMarket from "../assets/Marketplace-Images/publicmarket.jpg";
import { FaShoppingCart, FaClock, FaHistory } from "react-icons/fa";

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
        await axiosInstance.get("/api/customers/dashboard", {
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
    <div className="min-h-screen bg-lime-50 pb-16">
      {/* ✅ Hero Section */}
      <section className="relative w-full h-25 md:h-72 lg:h-80">
        <img
          src={publicMarket}
          alt="Marketplace Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="absolute bottom-4 right-4 text-4xl md:text-7xl font-bold drop-shadow-lg text-white">
            Tumana Market
          </h1>
        </div>
      </section>

      {/* ✅ Mobile Search & Filter */}
      <div className="md:hidden px-4 pt-4">
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />

          <details className="w-full max-w-md">
            <summary className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg text-center">
              Show Filters
            </summary>
            <div className="mt-2 bg-white border border-green-300 rounded-lg p-4">
              <label className="text-sm font-semibold text-green-700 mb-2 block">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <label className="text-sm font-semibold text-green-700 mb-2 block">Price Range (₱):</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="flex gap-6 px-4 pt-5">
        {/* ✅ Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border border-green-300 rounded-lg shadow-md p-4 h-fit">
          <h2 className="text-lg font-bold text-green-800 mb-4">Filters</h2>

          <input
            type="text"
            placeholder="🔍 Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />

          <label className="text-sm font-semibold text-green-700 mb-2 block">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <label className="text-sm font-semibold text-green-700 mb-2 block">Price Range (₱):</label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
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
                    ? "bg-green-500 text-white hover:bg-green-400 cursor-pointer"
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

          {/* ✅ Desktop-only Cart & Orders */}
          {customerStatus === "verified" && (
            <>
              <div className="mt-8 border-t pt-4">
                <button
                  onClick={() => navigate("/my-cart")}
                  className="w-full py-2 bg-lime-700 text-white font-medium rounded hover:bg-lime-600/75 cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <FaShoppingCart className="h-5 w-5" />
                  <span>View My Cart</span>
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate("/customer/ongoing-orders")}
                  className="w-full py-2 bg-lime-700 text-white font-medium rounded hover:bg-lime-600/75 cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <FaClock className="h-5 w-5" />
                  <span>Ongoing Orders</span>
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate("/customer/order-history")}
                  className="w-full py-2 bg-lime-700 text-white font-medium rounded hover:bg-lime-600/75 cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <FaHistory className="h-5 w-5" />
                  <span>Order History</span>
                </button>
              </div>
            </>
          )}
        </aside>

        {/* ✅ Main Content */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">No matching products found.</div>
          ) : (      
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-green-300 rounded-lg shadow hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-1">
                    <h3 className="text-lg font-bold text-green-800">{product.productName}</h3>
                    <p className="text-sm text-gray-700">
                      ₱{product.pricePerUnit} / {product.unitType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.type} • Stock: {product.stock}
                    </p>
                    <button
                      onClick={() => navigate(`/marketplace/${product._id}`)}
                      className="mt-3 w-full py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 hover:text-lime-900 transition cursor-pointer"
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

      {/* ✅ Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-300 shadow-md z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {customerStatus === "verified" ? (
            <>
              <button
                onClick={() => navigate("/my-cart")}
                className="flex flex-col items-center text-green-700 hover:text-green-900"
              >
                <FaShoppingCart className="h-6 w-6" />
                <span className="text-xs">Cart</span>
              </button>
              <button
                onClick={() => navigate("/customer/ongoing-orders")}
                className="flex flex-col items-center text-green-700 hover:text-green-900"
              >
                <FaClock className="h-6 w-6" />
                <span className="text-xs">Ongoing</span>
              </button>
              <button
                onClick={() => navigate("/customer/order-history")}
                className="flex flex-col items-center text-green-700 hover:text-green-900"
              >
                <FaHistory className="h-6 w-6" />
                <span className="text-xs">History</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (customerStatus === "none") {
                  navigate("/customer/register");
                }
              }}
              className={`w-full py-2 px-4 font-medium rounded text-center ${
                customerStatus === "none"
                  ? "bg-green-500 text-white hover:bg-green-400"
                  : "bg-yellow-400 text-yellow-900"
              }`}
            >
              {customerStatus === "none" ? "Be a Customer" : "Pending Registration"}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Marketplace;
