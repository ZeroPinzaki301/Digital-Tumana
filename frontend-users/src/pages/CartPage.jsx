
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/carts/items", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(res.data.cart.items || []);
      } catch (err) {
        console.error("Cart fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQty, stock) => {
    if (newQty < 1 || newQty > stock) return;
    setUpdatingItemId(itemId);
    try {
      await axiosInstance.post("/api/carts/add", {
        productId: itemId,
        quantity: newQty - (cart.find(i => i.productId._id === itemId)?.quantity || 0),
        stockLimit: stock
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setCart(prev =>
        prev.map(item =>
          item.productId._id === itemId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    } catch (err) {
      console.error("Quantity update failed:", err.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemMongoId) => {
    try {
      await axiosInstance.delete(`/api/carts/items/${itemMongoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCart(prev => prev.filter(item => item._id !== itemMongoId));
    } catch (err) {
      console.error("Remove failed:", err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      navigate("/cart-order-preview");
    } catch (err) {
      console.error("Checkout redirect failed:", err.message);
    }
  };

  const calculateTotals = () => {
    const sellerTracker = new Set();
    let productTotal = 0;
    let shippingTotal = 0;

    cart.forEach(item => {
      const product = item.productId;
      const sellerId = product.sellerId?._id || product.sellerId;

      productTotal += product.pricePerUnit * item.quantity;

      if (!sellerTracker.has(sellerId)) {
        shippingTotal += 50;
        sellerTracker.add(sellerId);
      }
    });

    return {
      productTotal,
      shippingTotal,
      grandTotal: productTotal + shippingTotal
    };
  };

  const { productTotal, shippingTotal, grandTotal } = calculateTotals();

  return (
    <div className="min-h-screen bg-lime-50 p-6">
      <button
        onClick={() => navigate("/marketplace")}
        className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition"
      >
        ⬅ Back to Marketplace
      </button>

      <h2 className="text-2xl font-bold text-lime-900 mb-6 text-center">My Cart</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {cart.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
              <div className="flex items-center gap-4">
                <img
                  src={item.productId.productImage}
                  alt={item.productId.productName}
                  className="h-24 w-24 object-cover rounded border border-lime-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-lime-800">
                    {item.productId.productName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ₱{item.productId.pricePerUnit} / {item.productId.unitType}
                  </p>
                  <p className="text-xs text-gray-500">Stock: {item.productId.stock}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity - 1, item.productId.stock)}
                  disabled={updatingItemId === item.productId._id}
                  className="px-3 py-1 bg-lime-200 text-lime-900 rounded hover:bg-lime-300 transition cursor-pointer"
                >
                  −
                </button>
                <span className="font-bold text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity + 1, item.productId.stock)}
                  disabled={updatingItemId === item.productId._id}
                  className="px-3 py-1 bg-lime-200 text-lime-900 rounded hover:bg-lime-300 transition cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                Subtotal: ₱{item.quantity * item.productId.pricePerUnit}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-sm text-red-600 underline hover:text-red-800 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="text-center bg-white max-w-xl mx-auto p-6 rounded-lg shadow-md border border-lime-300">
          <h4 className="text-lg font-semibold text-lime-700 mb-2">Total Amount</h4>
          <p className="text-sm text-gray-700 mb-1">Products Total: ₱{productTotal}</p>
          <p className="text-sm text-gray-700 mb-4">Shipping Total: ₱{shippingTotal}</p>
          <p className="text-xl font-bold text-lime-800">Grand Total: ₱{grandTotal}</p>

          <button
            onClick={handleCheckout}
            className="w-full py-2 mt-4 bg-lime-600 text-white rounded-lg hover:bg-lime-500/75 hover:text-sky-900 transition cursor-pointer"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
