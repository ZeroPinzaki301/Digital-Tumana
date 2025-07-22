import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderPreviewPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get("quantity")) || 1;
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/orders/preview/product/${productId}?quantity=${quantity}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreview(res.data);
      } catch (err) {
        console.error("Preview failed:", err.message);
      }
    };
    fetchPreview();
  }, [productId, quantity]);

  const handlePlaceOrder = async () => {
    try {
      await axiosInstance.post("/api/orders/direct", {
        productId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("Order placed successfully!");
      navigate("/customer-orders");
    } catch (err) {
      console.error("Order failed:", err.message);
      alert("Something went wrong.");
    }
  };

  if (!preview) {
    return <p className="text-center p-6 text-gray-600">Loading order preview...</p>;
  }

  const { product, seller, deliveryTo, summary } = preview;

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-emerald-300">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4 text-center">Order Summary</h2>

        <img
          src={product.image}
          alt={product.name}
          className="w-full max-w-md mx-auto mb-4 rounded border border-emerald-300"
        />

        <div className="mb-4 text-sm text-gray-700">
          <p><strong>Product:</strong> {product.name} ({product.type})</p>
          <p><strong>Unit:</strong> {product.unit}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
          <p><strong>Price per Unit:</strong> ₱{product.price}</p>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <h3 className="font-semibold text-emerald-800 mb-2">Delivery Address</h3>
          <p>{deliveryTo.fullName}</p>
          <p>{deliveryTo.street}, {deliveryTo.barangay}, {deliveryTo.cityOrMunicipality}</p>
          <p>{deliveryTo.province}, {deliveryTo.region}</p>
          <p>Tel: {deliveryTo.telephone}</p>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <h3 className="font-semibold text-emerald-800 mb-2">Seller</h3>
          <p>{seller.storeName}</p>
          <p>{seller.region}</p>
          <p>Tel: {seller.telephone}</p>
        </div>

        <div className="bg-emerald-100 p-4 rounded-lg text-gray-900 font-semibold mb-4">
          <p>Subtotal: ₱{summary.subtotal}</p>
          <p>Shipping Fee: ₱{summary.shippingFee}</p>
          <p>Total: ₱{summary.total}</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handlePlaceOrder}
            className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPreviewPage;