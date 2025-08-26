import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderPreviewPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get("quantity")) || 1;
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/api/orders/preview/product/${productId}?quantity=${quantity}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPreview(res.data);
      } catch (err) {
        console.error("Preview failed:", err.message);
      }
    };
    fetchPreview();
  }, [productId, quantity]);

  const handlePlaceOrder = async () => {
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions to proceed with your order");
      return;
    }
    try {
      await axiosInstance.post(
        "/api/orders/direct",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Order placed successfully!");
      navigate("/customer/ongoing-orders");
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
    <div className="min-h-screen bg-lime-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md border border-lime-200">
        <h2 className="text-2xl font-bold text-lime-900 mb-6 text-center">Order Summary</h2>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg border border-lime-200 mb-4 shadow-sm"
            />

            <div className="mb-4 text-sm text-gray-700 space-y-1">
              <p><strong>Product:</strong> {product.name} ({product.type})</p>
              <p><strong>Unit:</strong> {product.unit}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              <p><strong>Price per Unit:</strong> ₱{product.price}</p>
            </div>

            <div className="mb-4 text-sm text-gray-700">
              <h3 className="font-semibold text-lime-800 mb-2">Seller</h3>
              <p>{seller.storeName}</p>
              <p>{seller.region}</p>
              <p>Tel: {seller.telephone}</p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4 text-sm text-gray-700">
              <h3 className="font-semibold text-lime-800 mb-2">Delivery Address</h3>
              <p>{deliveryTo.fullName}</p>
              <p>{deliveryTo.street}, {deliveryTo.barangay}, {deliveryTo.cityOrMunicipality}</p>
              <p>{deliveryTo.province}, {deliveryTo.region}</p>
              <p>Tel: {deliveryTo.telephone}</p>
            </div>

            <div className="bg-lime-100 p-4 rounded-lg text-gray-900 font-semibold mb-4">
              <p>Subtotal: ₱{summary.subtotal}</p>
              <p>Shipping Fee: ₱{summary.shippingFee}</p>
              <p>Total: ₱{summary.total}</p>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-4 p-4 border border-lime-200 rounded-lg">
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
                    className="text-lime-900 underline hover:text-lime-700 cursor-pointer"
                  >
                    Terms & Conditions and Privacy Policy
                  </button>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-lime-400/50 text-lime-800 rounded hover:text-white cursor-pointer hover:bg-lime-500 transition"
              >
                Cancel
              </button>

              <button
                onClick={handlePlaceOrder}
                disabled={!acceptedTerms}
                className={`px-4 py-2 rounded transition ${
                  acceptedTerms
                    ? "bg-lime-700 text-white hover:text-lime-900 cursor-pointer hover:bg-lime-600/75"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Confirm Order
              </button>
            </div>
          </div>
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

export default OrderPreviewPage;