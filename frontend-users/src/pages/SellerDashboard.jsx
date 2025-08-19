import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaUserCircle, FaCheck, FaTimes } from "react-icons/fa";

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
          headers: { Authorization: `Bearer ${token}` }
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

  const buttonBase = "py-2 px-2 bg-lime-600 text-white rounded-lg hover:bg-lime-600/75 hover:text-sky-900 transition cursor-pointer";

  if (statusCode === 410) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 shadow-emerald-900 max-w-sm text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Registration Declined</h2>
          <p className="text-gray-700">Your seller registration has been declined. Please review and reapply.</p>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axiosInstance.delete("/api/sellers/me", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                navigate("/seller-registration");
              } catch {
                navigate("/seller-registration");
              }
            }}
            className={buttonBase + " mt-4 w-full"}
          >
            Re-register as Seller
          </button>
        </div>
      </div>
    );
  }

  if (statusCode === 404) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 shadow-lg max-w-sm text-center">
          <h2 className="text-xl font-bold text-orange-700 mb-2">Seller Profile Not Found</h2>
          <p className="text-gray-700">You haven't registered as a seller yet.</p>
          <button
            onClick={() => navigate("/seller-registration")}
            className={buttonBase + " mt-4 w-full"}
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  if (statusCode === 403) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 shadow-lg max-w-sm text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Awaiting Verification</h2>
          <p className="text-gray-700">Your seller application is still under review.</p>
          <button
            onClick={() => navigate("/account")}
            className={buttonBase + " mt-4 w-full"}
          >
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  if (!seller && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        Loading seller dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-sky-900 mb-4">Edit Profile</h3>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Change Store Name</label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter new store name"
              />
              <button onClick={handleNameUpdate} className={buttonBase + " mt-2 w-full"}>
                Update Name
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Change Profile Picture</label>
              <button onClick={handleProfileClick} className={buttonBase + " w-full"}>
                Change Picture
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureUpload}
                className="hidden"
                accept="image/*"
              />
              {uploading && <p className="text-sm text-gray-500 mt-2 text-center">Uploading picture...</p>}
              {uploadStatus === "success" && (
                <div className="flex items-center justify-center mt-2 text-lime-600">
                  <FaCheck className="mr-1" /> Picture uploaded successfully!
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center justify-center mt-2 text-red-600">
                  <FaTimes className="mr-1" /> Upload failed. Please try again.
                </div>
              )}
            </div>

            <button onClick={() => setShowEditModal(false)} className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white max-w-5xl w-full p-6 shadow-xl flex flex-col md:flex-row gap-6">
        {/* Seller Profile Section */}
        <div className="md:w-[60%] w-full text-center bg-sky-50 p-4 relative">
          <button onClick={() => setShowEditModal(true)} className={buttonBase + " absolute top-4 right-4 px-3 py-1"}>
            Edit
          </button>

          <div>
            {seller.storePicture === "default-profile.png" ? (
              <FaUserCircle className="w-32 h-32 mx-auto text-gray-500 mb-4 border-2 border-sky-900 rounded-full" />
            ) : (
              <img
                src={seller.storePicture}
                alt="Store"
                className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-sky-900 mb-4"
              />
            )}
          </div>

          <h2 className="text-2xl font-bold text-sky-900 mb-2">{seller.storeName}</h2>
          <p className="text-sm text-gray-600 mb-6">{seller.email}</p>

          <div className="text-left text-sm space-y-2 text-gray-700">
            <p><strong>Owner:</strong> {seller.firstName} {seller.middleName} {seller.lastName}</p>
            <p><strong>Sex:</strong> {seller.sex}</p>
            <p><strong>Age:</strong> {seller.age}</p>
            <p><strong>Birthdate:</strong> {new Date(seller.birthdate).toLocaleDateString()}</p>
            <p><strong>Nationality:</strong> {seller.nationality}</p>
            <p><strong>Status:</strong> {seller.status}</p>
          </div>

          <button onClick={() => navigate("/affiliate-dashboards")} className={buttonBase + " mt-6 w-full"}>
            Back to Affiliate Dashboards
          </button>
        </div>

        {/* Quick Access Section */}
        <div className="md:w-[40%] w-full bg-emerald-50 p-4">
          <h3 className="text-xl font-semibold text-sky-900 mb-4 text-center">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Products", path: "/seller-products" },
              { label: "My Address", path: "/seller-address" },
              { label: "Orders", path: "/order-requests", badge: hasPendingOrders },
              { label: "Contacts", path: "/seller-contacts" },
              { label: "Ongoing Orders", path: "/seller-ongoing-orders" },
              { label: "Seller Balance", path: "/seller-balance" },
            ].map(({ label, path, badge }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={buttonBase + " relative"}
              >
                {label}
                {badge && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
