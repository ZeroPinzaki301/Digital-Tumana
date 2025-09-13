import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
}

const OrderPreviewPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get("quantity")) || 1;
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    street: "",
    barangay: "",
    cityOrMunicipality: "",
    province: "",
    region: ""
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/api/orders/preview/product/${productId}?quantity=${quantity}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPreview(res.data);
        
        // Pre-fill manual address with customer's current address
        if (res.data.deliveryTo) {
          setManualAddress({
            street: res.data.deliveryTo.street || "",
            barangay: res.data.deliveryTo.barangay || "",
            cityOrMunicipality: res.data.deliveryTo.cityOrMunicipality || "",
            province: res.data.deliveryTo.province || "",
            region: res.data.deliveryTo.region || ""
          });
        }
      } catch (err) {
        console.error("Preview failed:", err.message);
        setAlertMessage("Failed to load order preview. Please try again.");
        setShowAlertModal(true);
      }
    };
    fetchPreview();
  }, [productId, quantity]);

  const useCustomerDefaultAddress = () => {
    if (preview && preview.deliveryTo) {
      const deliveryTo = preview.deliveryTo;
      
      // Set manual address fields
      setManualAddress({
        street: deliveryTo.street || "",
        barangay: deliveryTo.barangay || "",
        cityOrMunicipality: deliveryTo.cityOrMunicipality || "",
        province: deliveryTo.province || "",
        region: deliveryTo.region || ""
      });
      
      setAddressDetails({
        province: deliveryTo.province || "",
        cityOrMunicipality: deliveryTo.cityOrMunicipality || "",
        barangay: deliveryTo.barangay || "",
        street: deliveryTo.street || "",
        region: deliveryTo.region || "",
        latitude: deliveryTo.latitude || null,
        longitude: deliveryTo.longitude || null,
        telephone: deliveryTo.telephone || "",
        email: deliveryTo.email || "",
        postalCode: deliveryTo.postalCode || "",
        fullName: deliveryTo.fullName || ""
      });
      
      setSelectedLocation(null);
      setUseDefaultAddress(true);
      setSuccessMessage("Default customer address loaded. You can proceed to confirm.");
      setShowSuccessModal(true);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Extract Philippine address components correctly
        const province = address.state || address.province || "";
        const cityOrMunicipality = address.city || address.town || address.municipality || "";
        const barangay = address.village || address.hamlet || address.neighbourhood || "";
        const region = address.region || "";
        
        // Update manual address with geocoded data
        setManualAddress(prev => ({
          ...prev,
          barangay: barangay || prev.barangay,
          cityOrMunicipality: cityOrMunicipality || prev.cityOrMunicipality,
          province: province || prev.province,
          region: region || prev.region
        }));
        
        setAddressDetails({
          province,
          cityOrMunicipality,
          barangay,
          street: manualAddress.street, // Keep the manually entered street
          region,
          latitude: lat,
          longitude: lng,
          telephone: preview?.deliveryTo?.telephone || "",
          email: preview?.deliveryTo?.email || "",
          postalCode: address.postcode || preview?.deliveryTo?.postalCode || "",
          fullName: preview?.deliveryTo?.fullName || ""
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAlertMessage("Failed to get address details. Please try again.");
      setShowAlertModal(true);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation([lat, lng]);
    setUseDefaultAddress(false);
    reverseGeocode(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAlertMessage("Geolocation is not supported by your browser");
      setShowAlertModal(true);
      return;
    }

    setIsGeocoding(true);
    setUseCurrentLocation(true);
    setUseDefaultAddress(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setAlertMessage("Unable to retrieve your location. Please select manually on the map.");
        setShowAlertModal(true);
        setIsGeocoding(false);
        setUseCurrentLocation(false);
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!acceptedTerms) {
      setAlertMessage("Please accept the terms and conditions to proceed with your order");
      setShowAlertModal(true);
      return;
    }
    
    // Show map modal for address selection
    setShowMapModal(true);
  };

  const confirmMapLocation = async () => {
    // If using default address, skip validation for selected location
    if (!useDefaultAddress && (!selectedLocation || !addressDetails)) {
      setAlertMessage("Please select a location on the map or use your current location");
      setShowAlertModal(true);
      return;
    }

    // Validate manual address fields
    if (!manualAddress.street || !manualAddress.barangay || !manualAddress.cityOrMunicipality || !manualAddress.province) {
      setAlertMessage("Please provide complete address information (street, barangay, city/municipality, province)");
      setShowAlertModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Prepare the delivery address object
      const deliveryAddressData = useDefaultAddress ? 
        // Use the customer's default address
        {
          ...addressDetails,
          street: manualAddress.street,
          barangay: manualAddress.barangay,
          cityOrMunicipality: manualAddress.cityOrMunicipality,
          province: manualAddress.province,
          region: manualAddress.region,
          fullName: preview?.deliveryTo?.fullName || "",
          telephone: preview?.deliveryTo?.telephone || "",
          email: preview?.deliveryTo?.email || ""
        } :
        // Use the map-selected address
        {
          ...addressDetails,
          street: manualAddress.street,
          barangay: manualAddress.barangay,
          cityOrMunicipality: manualAddress.cityOrMunicipality,
          province: manualAddress.province,
          region: manualAddress.region,
          fullName: preview?.deliveryTo?.fullName || "",
          telephone: preview?.deliveryTo?.telephone || "",
          email: preview?.deliveryTo?.email || ""
        };
      
      // Create order with the selected address
      await axiosInstance.post("/api/orders/direct", 
        { 
          productId, 
          quantity,
          deliveryAddress: deliveryAddressData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage("Order placed successfully!");
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate("/customer/ongoing-orders");
      }, 2000);
    } catch (err) {
      console.error("Order failed:", err.message);
      setAlertMessage("Something went wrong during checkout.");
      setShowAlertModal(true);
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
              <p>Email: {seller.email}</p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4 text-sm text-gray-700">
              <h3 className="font-semibold text-lime-800 mb-2">Current Delivery Address</h3>
              <p>{deliveryTo.fullName}</p>
              <p>{deliveryTo.street}, {deliveryTo.barangay}, {deliveryTo.cityOrMunicipality}</p>
              <p>{deliveryTo.province}, {deliveryTo.region}</p>
              <p>Tel: {deliveryTo.telephone}</p>
              <p>Email: {deliveryTo.email}</p>
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

        {/* Map Modal */}
        {showMapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-lime-900 mb-4">Select Delivery Location</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide your exact delivery location. You can use your current location, select on the map, or use your default address.
                The street field must be filled manually, while other fields will be automatically filled when you select a location.
              </p>
              
              {/* Location Options */}
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={getCurrentLocation}
                  disabled={isGeocoding}
                  className={`px-4 py-2 rounded ${
                    isGeocoding 
                      ? "bg-gray-300 cursor-not-allowed" 
                      : "bg-lime-600 text-white hover:bg-lime-700"
                  }`}
                >
                  {isGeocoding && useCurrentLocation ? "Getting Location..." : "Use My Current Location"}
                </button>
                
                <button
                  onClick={useCustomerDefaultAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Use My Default Address
                </button>
                
                <p className="text-sm text-gray-600 self-center">or click on the map to select a location</p>
              </div>
              
              {/* Manual Address Inputs */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Number, and Street*</label>
                  <input
                    type="text"
                    value={manualAddress.street}
                    onChange={(e) => setManualAddress({...manualAddress, street: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter street name and number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barangay*</label>
                  <input
                    type="text"
                    value={manualAddress.barangay}
                    onChange={(e) => setManualAddress({...manualAddress, barangay: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter barangay"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City/Municipality*</label>
                  <input
                    type="text"
                    value={manualAddress.cityOrMunicipality}
                    onChange={(e) => setManualAddress({...manualAddress, cityOrMunicipality: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter city or municipality"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province*</label>
                  <input
                    type="text"
                    value={manualAddress.province}
                    onChange={(e) => setManualAddress({...manualAddress, province: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter province"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={manualAddress.region}
                    onChange={(e) => setManualAddress({...manualAddress, region: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter region"
                  />
                </div>
              </div>
              
              <div className="h-96 w-full mb-4 rounded-lg overflow-hidden">
                <MapContainer 
                  center={[14.5995, 120.9842]} // Manila coordinates
                  zoom={11} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {selectedLocation && <Marker position={selectedLocation} />}
                </MapContainer>
              </div>
              
              {isGeocoding && (
                <div className="text-center text-gray-600 mb-4">Getting address details...</div>
              )}
              
              {(addressDetails && !isGeocoding) || useDefaultAddress ? (
                <div className="mb-4 p-4 border border-lime-200 rounded-lg">
                  <h4 className="font-semibold text-lime-800 mb-2">Selected Address:</h4>
                  <p>{manualAddress.street}, {manualAddress.barangay}</p>
                  <p>{manualAddress.cityOrMunicipality}, {manualAddress.province}</p>
                  {addressDetails?.latitude && (
                    <p className="text-xs text-gray-500">Coordinates: {addressDetails.latitude?.toFixed(6)}, {addressDetails.longitude?.toFixed(6)}</p>
                  )}
                  {useDefaultAddress && (
                    <p className="text-xs text-blue-500 mt-2">Using your default customer address</p>
                  )}
                </div>
              ) : null}
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    setSelectedLocation(null);
                    setAddressDetails(null);
                    setUseCurrentLocation(false);
                    setUseDefaultAddress(false);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmMapLocation}
                  disabled={(!selectedLocation && !useDefaultAddress) || isGeocoding || !manualAddress.street || !manualAddress.barangay || !manualAddress.cityOrMunicipality || !manualAddress.province}
                  className={`px-4 py-2 rounded text-white ${
                    (selectedLocation || useDefaultAddress) && !isGeocoding && manualAddress.street && manualAddress.barangay && manualAddress.cityOrMunicipality && manualAddress.province
                      ? "bg-lime-700 hover:bg-lime-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Delivery Location
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-lime-900 mb-4">Notification</h3>
              <p className="text-gray-700 mb-6">{alertMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-lime-900 mb-4">Success</h3>
              <p className="text-gray-700 mb-6">{successMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (successMessage === "Order placed successfully!") {
                      navigate("/customer/ongoing-orders");
                    }
                  }}
                  className="px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 cursor-pointer"
                >
                  OK
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