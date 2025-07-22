import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CartOrderPreviewPage = () => {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/orders/preview/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreview(res.data);
      } catch (err) {
        console.error("Cart preview failed:", err.message);
      }
    };
    fetchPreview();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post("/api/orders/checkout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Orders placed successfully!");
      navigate("/customer-orders");
    } catch (err) {
      console.error("Checkout failed:", err.message);
      alert("Something went wrong during checkout.");
    }
  };

  if (!preview) {
    return <p className="text-center p-6 text-gray-600">Loading cart preview...</p>;
  }

  const { items, deliveryTo } = preview;

  // 🧮 Calculate totals
  const sellerTracker = new Set();
  let productTotal = 0;
  let shippingTotal = 0;

  items.forEach(entry => {
    productTotal += entry.summary.subtotal;
    const sellerKey = entry.seller.storeName + entry.seller.telephone;
    if (!sellerTracker.has(sellerKey)) {
      shippingTotal += 50;
      sellerTracker.add(sellerKey);
    }
  });

  const grandTotal = productTotal + shippingTotal;

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-emerald-300">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Cart Order Summary</h2>

        {/* 🧺 Loop through cart items */}
        {items.map((entry, index) => (
          <div key={index} className="mb-6 border-b pb-4">
            <img
              src={entry.product.image}
              alt={entry.product.name}
              className="w-full max-w-sm mx-auto mb-4 rounded border border-emerald-300"
            />

            <div className="mb-2 text-sm text-gray-700">
              <p><strong>Product:</strong> {entry.product.name} ({entry.product.type})</p>
              <p><strong>Unit:</strong> {entry.product.unit}</p>
              <p><strong>Quantity:</strong> {entry.product.quantity}</p>
              <p><strong>Price per Unit:</strong> ₱{entry.product.price}</p>
            </div>

            <div className="mb-2 text-sm text-gray-700">
              <h3 className="font-semibold text-emerald-800 mb-1">Seller</h3>
              <p>{entry.seller.storeName}</p>
              <p>{entry.seller.region}</p>
              <p>Tel: {entry.seller.telephone}</p>
              <p>Email: {entry.seller.email}</p>
            </div>

            <div className="bg-emerald-100 p-3 rounded-lg text-gray-900 font-semibold">
              <p>Subtotal: ₱{entry.summary.subtotal}</p>
              <p>Total: ₱{entry.summary.total}</p>
            </div>
          </div>
        ))}

        {/* 🚚 Delivery Info */}
        <div className="mb-6 text-sm text-gray-700">
          <h3 className="font-semibold text-emerald-800 mb-2">Delivery Address</h3>
          <p>{deliveryTo.fullName}</p>
          <p>{deliveryTo.street}, {deliveryTo.barangay}, {deliveryTo.cityOrMunicipality}</p>
          <p>{deliveryTo.province}, {deliveryTo.region}</p>
          <p>Tel: {deliveryTo.telephone}</p>
          <p>Email: {deliveryTo.email}</p>
        </div>

        {/* 💸 Consolidated Summary */}
        <div className="bg-emerald-200 p-4 rounded-lg text-gray-900 font-bold mb-4 text-center">
          <p className="text-sm mb-1">Products Total: ₱{productTotal}</p>
          <p className="text-sm mb-1">Shipping Total: ₱{shippingTotal}</p>
          <p className="text-lg">Grand Total: ₱{grandTotal}</p>
        </div>

        {/* ✅ Confirm */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/my-cart")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handlePlaceOrder}
            className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800"
          >
            Confirm Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartOrderPreviewPage;