import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CartOrderPreviewPage = () => {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

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
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions to proceed with your order");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post("/api/orders/checkout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Orders placed successfully!");
      navigate("/customer/ongoing-orders");
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
    <div className="min-h-screen bg-lime-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-lime-300">
        <h2 className="text-2xl font-bold text-lime-900 mb-6 text-center">Cart Order Summary</h2>

        {/* 🧺 Loop through cart items */}
        {items.map((entry, index) => (
          <div key={index} className="mb-6 border-b pb-4">
            <img
              src={entry.product.image}
              alt={entry.product.name}
              className="w-full max-w-sm mx-auto mb-4 rounded border border-lime-300"
            />

            <div className="mb-2 text-sm text-gray-700">
              <p><strong>Product:</strong> {entry.product.name} ({entry.product.type})</p>
              <p><strong>Unit:</strong> {entry.product.unit}</p>
              <p><strong>Quantity:</strong> {entry.product.quantity}</p>
              <p><strong>Price per Unit:</strong> ₱{entry.product.price}</p>
            </div>

            <div className="mb-2 text-sm text-gray-700">
              <h3 className="font-semibold text-lime-800 mb-1">Seller</h3>
              <p>{entry.seller.storeName}</p>
              <p>{entry.seller.region}</p>
              <p>Tel: {entry.seller.telephone}</p>
              <p>Email: {entry.seller.email}</p>
            </div>

            <div className="bg-lime-100 p-3 rounded-lg text-gray-900 font-semibold">
              <p>Subtotal: ₱{entry.summary.subtotal}</p>
              <p>Total: ₱{entry.summary.total}</p>
            </div>
          </div>
        ))}

        {/* 🚚 Delivery Info */}
        <div className="mb-6 text-sm text-gray-700">
          <h3 className="font-semibold text-lime-800 mb-2">Delivery Address</h3>
          <p>{deliveryTo.fullName}</p>
          <p>{deliveryTo.street}, {deliveryTo.barangay}, {deliveryTo.cityOrMunicipality}</p>
          <p>{deliveryTo.province}, {deliveryTo.region}</p>
          <p>Tel: {deliveryTo.telephone}</p>
          <p>Email: {deliveryTo.email}</p>
        </div>

        {/* 💸 Consolidated Summary */}
        <div className="bg-lime-200 p-4 rounded-lg text-gray-900 font-bold mb-4 text-center">
          <h4 className="text-lg font-semibold text-lime-700 mb-1">Total Amount</h4>
          <p className="text-sm mb-1">Products Total: ₱{productTotal}</p>
          <p className="text-sm mb-1">Shipping Total: ₱{shippingTotal}</p>
          <p className="text-xl font-bold mt-1">Grand Total: ₱{grandTotal}</p>
        </div>

        {/* Terms and Conditions Section */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 mr-2 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
              I have read and agree to the{' '}
              <button 
                type="button" 
                onClick={() => setShowPolicy(true)}
                className="text-lime-700 underline hover:text-lime-600/75 cursor-pointer"
              >
                Terms & Conditions and Privacy Policy
              </button>
            </label>
          </div>
        </div>

        {/* ✅ Confirm */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/my-cart")}
            className="px-4 py-2 bg-lime-400/50 text-gray-800 rounded hover:bg-lime-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={!acceptedTerms}
            className={`px-4 py-2 rounded ${
              acceptedTerms 
                ? "bg-lime-700 text-white hover:bg-lime-600/75 cursor-pointer hover:text-sky-900"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm Orders
          </button>
        </div>

       {/* Policy Modal */}
        {showPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-lime-900 mb-6">Terms & Conditions and Privacy Policy</h3>
              
              <div className="prose prose-sm text-gray-700 mb-4 leading-relaxed space-y-4">
                <h4 className="font-semibold">Terms & Conditions</h4>
                <p><strong>By placing an order on Digital Tumana, you agree to the following terms and conditions:</strong></p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Order Confirmation:</strong> Once you complete the checkout process, your order will be confirmed instantly on the website. Please review all details carefully before submitting your order.</li>
                  <li><strong>Payment:</strong> All payments must be made through the available payment options provided on our platform. Orders will only be processed once payment is confirmed.</li>
                  <li><strong>Pricing and Availability:</strong> Prices and product availability are subject to change without notice. If a product becomes unavailable after payment, we will notify you and issue a refund.</li>
                  <li><strong>Shipping and Delivery:</strong> Delivery times may vary depending on your location. We are not responsible for delays caused by couriers or circumstances beyond our control.</li>
                  <li><strong>Use of Information:</strong> You agree to provide accurate details (name, address, contact information) for successful delivery. Incorrect details may lead to delays or non-delivery.</li>
                </ul>

                <h4 className="font-semibold mt-4">Privacy Policy</h4>
                <p><strong>We respect your privacy and follow the Philippine Data Privacy Act of 2012 (RA 10173) to protect your personal data.</strong></p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Information We Collect:</strong> When you checkout, we collect your name, shipping address, contact number, and payment details to process your order.</li>
                  <li><strong>How We Use Your Information:</strong> We use your information to process your purchase, deliver your order, and send you updates about your transaction. We may also use it for fraud prevention and legal compliance.</li>
                  <li><strong>Sharing of Information:</strong> We only share your details with trusted service providers like payment processors and couriers. We do not sell or trade your personal data.</li>
                  <li><strong>Data Security:</strong> We use encryption and secure systems to protect your information during and after checkout.</li>
                  <li><strong>Your Rights:</strong> You may request to access, update, or delete your data by contacting us.</li>
                  <li><strong>Consent:</strong> By completing the checkout process, you agree to this Privacy Policy and authorize us to process your personal information for your order.</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPolicy(false)}
                  className="px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOrderPreviewPage;