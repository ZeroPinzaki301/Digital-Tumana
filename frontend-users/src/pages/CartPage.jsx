import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/carts/items", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(res.data.cart.items || []);
        setSelectedItems(res.data.cart.items?.map(item => item._id) || []);
      } catch (err) {
        console.error("Cart fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item._id));
    }
  };

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
      setSelectedItems(prev => prev.filter(id => id !== itemMongoId));
    } catch (err) {
      console.error("Remove failed:", err.message);
    }
  };

  const handleCheckout = () => {
    // Pass only the selected item IDs (not full objects)
    navigate("/cart-order-preview", { 
      state: { selectedItemIds: selectedItems } 
    });
  };

  const calculateTotals = () => {
    const sellerTracker = new Set();
    let productTotal = 0;
    let shippingTotal = 0;

    cart.filter(item => selectedItems.includes(item._id)).forEach(item => {
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
        className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition mb-6"
      >
        ⬅ Back to Marketplace
      </button>

      <h2 className="text-2xl font-bold text-lime-900 mb-6 text-center">My Cart</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 overflow-y-auto max-h-[70vh] pr-4">
            <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300 mb-4 flex items-center">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedItems.length === cart.length && cart.length > 0}
                onChange={selectAllItems}
                className="h-5 w-5 text-lime-600 rounded focus:ring-lime-500"
              />
              <label htmlFor="select-all" className="ml-2 text-lime-800 font-medium">
                Select all items
              </label>
            </div>
            
            {cart.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow-md border border-lime-300 mb-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => toggleItemSelection(item._id)}
                    className="h-5 w-5 mt-2 text-lime-600 rounded focus:ring-lime-500"
                  />
                  <img
                    src={item.productId.productImage}
                    alt={item.productId.productName}
                    className="h-24 w-24 object-cover rounded border border-lime-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-lime-800">
                      {item.productId.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ₱{item.productId.pricePerUnit} / {item.productId.unitType}
                    </p>
                    <p className="text-xs text-gray-500">Stock: {item.productId.stock}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 ml-9">
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

                <div className="mt-2 text-sm text-gray-700 ml-9">
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

          <div className="hidden md:block w-px bg-lime-300"></div>

          <div className={`bg-white border border-lime-300 rounded-lg shadow-md flex-shrink-0 
            transition-all duration-300 overflow-hidden
            ${isMobile ? "sticky bottom-0 w-full px-4 py-2" : "md:w-96 md:p-6 md:sticky md:top-6"}`}>

            {isMobile && (
              <div className="flex flex-col">
                {expanded && (
                  <div className="mb-2">
                    <h4 className="text-lg font-semibold text-lime-700 mb-1">Total Amount</h4>
                    <p className="text-sm text-gray-700">Products Total: ₱{productTotal}</p>
                    <p className="text-sm text-gray-700 mb-2">Shipping Total: ₱{shippingTotal}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-lime-800">Grand Total: ₱{grandTotal}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCheckout}
                      disabled={selectedItems.length === 0}
                      className="py-1 px-3 bg-lime-600 text-white rounded cursor-pointer hover:bg-lime-500 transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Checkout
                    </button>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-lime-800 font-bold text-lg cursor-pointer transform transition-transform duration-200"
                    >
                      {expanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isMobile && (
              <div>
                <h4 className="text-lg font-semibold text-lime-700 mb-2">Total Amount</h4>
                <p className="text-sm text-gray-700 mb-1">Products Total: ₱{productTotal}</p>
                <p className="text-sm text-gray-700 mb-4">Shipping Total: ₱{shippingTotal}</p>
                <p className="text-xl font-bold text-lime-800 mb-4">Grand Total: ₱{grandTotal}</p>
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full py-2 bg-lime-600 text-white cursor-pointer rounded-lg hover:bg-lime-500/75 hover:text-sky-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {selectedItems.length === 0 ? "Select items to checkout" : `Checkout (${selectedItems.length} items)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;