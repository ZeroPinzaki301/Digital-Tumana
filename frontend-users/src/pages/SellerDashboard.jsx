import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import {
  FaUserCircle,
  FaCheck,
  FaTimes,
  FaEdit,
  FaBell,
  FaStore,
} from "react-icons/fa";

const SellerDashboard = () => {
  const [seller, setSeller] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const calculateAge = (birthdate) => {
    if (!birthdate) return "N/A";
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };


  const buttonBase =
    "relative bg-white border border-lime-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer";

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/sellers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
          params: { t: Date.now() },
        });
        setSeller(res.data.seller);
        setNewStoreName(res.data.seller.storeName);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchSeller();

    const checkPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/orders/seller/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasPendingOrders(res.data.orders.length > 0);
      } catch (err) {
        console.error("Failed to check pending orders:", err.message);
      }
    };
    checkPendingOrders();
  }, []);

  const handleProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("storePicture", file);

      const token = localStorage.getItem("token");
      await axiosInstance.put("/api/sellers/picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const refreshed = await axiosInstance.get("/api/sellers/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      });
      setSeller(refreshed.data.seller);
      setUploadStatus("success");
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleNameUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put(
        "/api/sellers/store-name",
        { storeName: newStoreName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSeller({ ...seller, storeName: res.data.storeName });
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating store name:", err);
    }
  };

  const renderStatusPage = (
    title,
    message,
    buttonText,
    buttonAction,
    bgColor,
    textColor
  ) => (
    <div
      className={`min-h-screen ${bgColor} flex items-center justify-center px-4 transition-all duration-500`}
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-transform duration-500 hover:scale-[1.02]">
        <h2 className={`text-2xl font-bold ${textColor} mb-4`}>{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={buttonAction}
          className="mt-4 w-full bg-lime-700 hover:bg-lime-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-300"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  if (statusCode === 410) {
    return renderStatusPage(
      "Registration Declined",
      "Your seller registration has been declined. Please review and reapply.",
      "Re-register as Seller",
      async () => {
        try {
          const token = localStorage.getItem("token");
          await axiosInstance.delete("/api/sellers/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigate("/seller-registration");
        } catch {
          navigate("/seller-registration");
        }
      },
      "bg-red-100",
      "text-red-700"
    );
  }

  if (statusCode === 404) {
    return renderStatusPage(
      "Seller Profile Not Found",
      "You haven't registered as a seller yet.",
      "Go to Registration",
      () => navigate("/seller-registration"),
      "bg-orange-100",
      "text-orange-700"
    );
  }

  if (statusCode === 403) {
    return renderStatusPage(
      "Awaiting Verification",
      "Your seller application is still under review.",
      "Back to Account",
      () => navigate("/account"),
      "bg-yellow-100",
      "text-yellow-700"
    );
  }

  if (!seller && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-lime-600 rounded-full mb-4"></div>
          <p>Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-4 md:p-8">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 scale-95 hover:scale-100">
            <h3 className="text-2xl font-bold text-sky-900 mb-6 text-center">
              Edit Store Profile
            </h3>

            <div className="mb-6">
              <label className="block text-gray-700 mb-3 text-lg font-medium">
                Change Store Name
              </label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter new store name"
              />
              <button
                onClick={handleNameUpdate}
                className="mt-4 w-full cursor-pointer py-3 px-4 bg-lime-600 text-white rounded-xl hover:bg-lime-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaEdit /> Update Name
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-3 text-lg font-medium">
                Change Store Picture
              </label>
              <button
                onClick={handleProfileClick}
                className="w-full cursor-pointer py-3 px-4 bg-lime-600 text-white rounded-xl hover:bg-lime-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaEdit /> Change Picture
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureUpload}
                className="hidden"
                accept="image/*"
              />
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 border-t-2 border-lime-600 border-solid rounded-full animate-spin"></div>
                  <p className="ml-2 text-gray-600">Uploading picture...</p>
                </div>
              )}
              {uploadStatus === "success" && (
                <div className="flex items-center justify-center mt-4 text-lime-600 bg-lime-50 p-3 rounded-lg animate-pulse">
                  <FaCheck className="mr-2" /> Picture uploaded successfully!
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center justify-center mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
                  <FaTimes className="mr-2" /> Upload failed. Please try again.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEditModal(false)}
              className="w-full py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 cursor-pointer font-medium hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white max-w-6xl w-full p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-8">
        {/* Seller Profile Section */}
        <div className="md:w-[60%] w-full text-center bg-gradient-to-b from-sky-50 to-emerald-50 p-6 rounded-2xl relative border border-sky-100 shadow-md">
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-5 right-5 bg-lime-600 text-white p-3 rounded-full hover:bg-lime-500 hover:shadow-md transition-all duration-300 hover:rotate-12"
            aria-label="Edit profile"
          >
            <FaEdit className="text-lg cursor-pointer" />
          </button>

          <div className="relative inline-block mb-6">
            {seller.storePicture === "default-profile.png" ? (
              <div className="relative">
                <FaUserCircle className="w-36 h-36 mx-auto text-gray-400 mb-4 border-4 border-sky-200 rounded-full p-2 shadow-inner hover:shadow-lg transition-all duration-300" />
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-lime-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FaStore className="text-white text-sm" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={seller.storePicture}
                  alt="Store"
                  className="w-36 h-36 mx-auto rounded-full object-cover border-4 border-sky-200 shadow-inner hover:shadow-lg transition-all duration-300"
                />
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-lime-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FaStore className="text-white text-sm" />
                </div>
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-sky-900 mb-3 transition-all duration-300 hover:text-sky-700">
            {seller.storeName}
          </h2>
          <p className="text-md text-gray-600 mb-8 font-medium">{seller.email}</p>

          <div className="text-left text-md space-y-3 text-gray-700 bg-white p-5 rounded-xl shadow-sm">
            <p><strong>Owner:</strong> {seller.firstName} {seller.middleName} {seller.lastName}</p>
            <p><strong>Sex:</strong> {seller.sex}</p>
            <p><strong>Age:</strong> {calculateAge(seller.birthdate)} years old</p>
            <p><strong>Birthdate:</strong> {new Date(seller.birthdate).toLocaleDateString()}</p>
            <p><strong>Nationality:</strong> {seller.nationality}</p>
            <p><strong>Status:</strong> <span className="text-lime-600 font-medium">{seller.status}</span></p>
          </div>

          <button
            onClick={() => navigate("/account")}
            className="mt-8 w-full py-3 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Back to Account
          </button>
        </div>

        {/* Quick Access Section */}
        <div className="md:w-[40%] w-full bg-gradient-to-b from-emerald-50 to-sky-50 p-6 rounded-2xl border border-emerald-100 shadow-md">
          <h3 className="text-2xl font-semibold text-sky-900 mb-6 text-center pb-3 border-b border-emerald-200">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Products", path: "/seller-products", desc: "Manage and update your products." },
              { label: "My Address", path: "/seller-address", desc: "Edit your store's pickup or delivery address." },
              { label: "Orders", path: "/order-requests", badge: hasPendingOrders, desc: "Handle incoming order requests." },
              { label: "Ongoing Orders", path: "/seller-ongoing-orders", desc: "Track and fulfill current orders." },
              { label: "Order History", path: "/seller-order-history", desc: "Review past orders" },
              { label: "Sales Analytics", path: "/seller-sales-analytics", desc: "Analyze the records of orders per product." },
              { label: "Seller Balance", path: "/seller-balance", desc: "Monitor your earnings and payouts." },
            ].map(({ label, path, badge, desc }) => (
              <div
                key={label}
                onClick={() => navigate(path)}
                className={`${buttonBase}`}
              >
                <div className="font-semibold text-sky-900 text-lg group-hover:text-lime-600 transition-all duration-300">
                  {label}
                </div>
                {badge && (
                  <span className="absolute top-2 right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 justify-center items-center text-xs text-white">
                      <FaBell className="text-xs" />
                    </span>
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
