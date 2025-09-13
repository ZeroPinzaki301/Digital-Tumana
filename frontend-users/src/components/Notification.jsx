import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

const Notification = () => {
  const [tesdaNotifications, setTesdaNotifications] = useState([]);
  const [orderNotifications, setOrderNotifications] = useState([]);
  const [jobApplicationNotifications, setJobApplicationNotifications] = useState([]);
  const [workerJobApplicationNotifications, setWorkerJobApplicationNotifications] = useState([]);
  const [outForDeliveryNotifications, setOutForDeliveryNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view notifications");
        setLoading(false);
        return;
      }

      // Fetch all notification types
      const [
        tesdaResponse, 
        orderResponse, 
        jobApplicationResponse, 
        workerJobApplicationResponse,
        outForDeliveryResponse
      ] = await Promise.all([
        axiosInstance.get("/api/notification/tesda", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/order", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/job-applications", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/worker-job-applications", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/out-for-delivery", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (tesdaResponse.data.success) {
        setTesdaNotifications(tesdaResponse.data.data);
      }
      
      if (orderResponse.data.success) {
        setOrderNotifications(orderResponse.data.data);
      }
      
      if (jobApplicationResponse.data.success) {
        setJobApplicationNotifications(jobApplicationResponse.data.data);
      }
      
      if (workerJobApplicationResponse.data.success) {
        setWorkerJobApplicationNotifications(workerJobApplicationResponse.data.data);
      }
      
      if (outForDeliveryResponse.data.success) {
        setOutForDeliveryNotifications(outForDeliveryResponse.data.data);
      }
      
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (err.response?.status === 401) {
        setError("Please log in to view notifications");
      } else {
        setError(err.response?.data?.message || "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTesdaNotificationClick = () => {
    navigate("/learn/tesda/enroll/status");
  };

  const handleOrderNotificationClick = (orderId) => {
    navigate(`/order-request-summary/${orderId}`);
  };

  const handleJobApplicationNotificationClick = (applicationId) => {
    navigate(`/employer/job-application/applicant-details/${applicationId}`);
  };

  const handleWorkerJobApplicationNotificationClick = (applicationId) => {
    navigate(`/jobs/job-application/ongoing-job/${applicationId}`);
  };

  const handleOutForDeliveryNotificationClick = (orderId) => {
    navigate(`/customer/ongoing-order/${orderId}`);
  };

  const getTesdaStatusMessage = (status) => {
    switch (status) {
      case "eligible":
        return "Your TESDA enrollment is now eligible for training";
      case "reserved":
        return "Your slot for TESDA training has been reserved";
      case "enrolled":
        return "You are now officially enrolled in TESDA training";
      default:
        return `Your TESDA enrollment status has been updated to ${status}`;
    }
  };

  const getTesdaStatusColor = (status) => {
    switch (status) {
      case "eligible":
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 cursor-pointer";
      case "reserved":
        return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 cursor-pointer";
      case "enrolled":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 cursor-pointer";
    }
  };

  const getJobApplicationStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "New job application received";
      case "workerConfirmation":
        return "Worker has confirmed interest - schedule interview";
      default:
        return `Job application status updated to ${status}`;
    }
  };

  const getJobApplicationStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 cursor-pointer";
      case "workerConfirmation":
        return "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 cursor-pointer";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 cursor-pointer";
    }
  };

  const getWorkerJobApplicationStatusMessage = (status) => {
    switch (status) {
      case "workerConfirmation":
        return "Employer interested! Interview scheduled";
      default:
        return `Job application status updated to ${status}`;
    }
  };

  const getWorkerJobApplicationStatusColor = (status) => {
    switch (status) {
      case "workerConfirmation":
        return "bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200 cursor-pointer";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 cursor-pointer";
    }
  };

  const getOutForDeliveryStatusMessage = () => {
    return "Your order is out for delivery!";
  };

  const getOutForDeliveryStatusColor = () => {
    return "bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200 cursor-pointer";
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-lime-700 mb-6">Notifications</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-100 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-lime-700 mb-6">Notifications</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            {error === "Please log in to view notifications" ? (
              <Link
                to="/login"
                className="px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition inline-block"
              >
                Log In
              </Link>
            ) : (
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-lime-700">Notifications</h2>
          <button
            onClick={fetchNotifications}
            className="px-3 py-1 text-sm bg-emerald-100 text-lime-700 rounded-lg hover:bg-emerald-200 transition"
          >
            Refresh
          </button>
        </div>

        {/* Out for Delivery Notifications */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-lime-700 mb-4">Delivery Updates</h3>
          {outForDeliveryNotifications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No delivery updates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outForDeliveryNotifications.map((order) => (
                <div
                  key={order._id}
                  className={`p-4 border rounded-lg ${getOutForDeliveryStatusColor()}`}
                  onClick={() => handleOutForDeliveryNotificationClick(order._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {getOutForDeliveryStatusMessage()}
                      </h3>
                      <p className="text-sm mt-1">
                        Order Total: {formatPrice(order.totalPrice)}
                      </p>
                      <p className="text-sm">
                        Seller: {order.sellerId?.businessName || 'Seller'}
                      </p>
                      <p className="text-sm mt-1">
                        Delivery to: {order.deliveryAddress?.street}, {order.deliveryAddress?.barangay}, {order.deliveryAddress?.cityOrMunicipality}
                      </p>
                    </div>
                    <span className="text-xs opacity-75 whitespace-nowrap">
                      {formatDate(order.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white text-cyan-800">
                      OUT FOR DELIVERY
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TESDA Notifications */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-lime-700 mb-4">TESDA Notifications</h3>
          {tesdaNotifications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No TESDA notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tesdaNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg ${getTesdaStatusColor(notification.status)}`}
                  onClick={handleTesdaNotificationClick}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {getTesdaStatusMessage(notification.status)}
                      </h3>
                      <p className="text-sm mt-1">
                        For {notification.firstName} {notification.middleName || ""} {notification.lastName}
                      </p>
                    </div>
                    <span className="text-xs opacity-75 whitespace-nowrap">
                      {formatDate(notification.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white">
                      {notification.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Notifications */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-lime-700 mb-4">Order Notifications</h3>
          {orderNotifications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No new orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderNotifications.map((order) => (
                <div
                  key={order._id}
                  className="p-4 border border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer"
                  onClick={() => handleOrderNotificationClick(order._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-orange-800">
                      New Order Received!
                    </h3>
                    <span className="text-xs text-orange-600 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm">
                      From: {order.buyerId?.firstName} {order.buyerId?.lastName}
                    </p>
                    <p className="text-sm font-medium">
                      Total: {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium mb-1">Items:</p>
                    <ul className="list-disc list-inside">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.productId?.name || 'Product'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-orange-200 text-orange-800">
                      PENDING
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Application Notifications (for Employers) */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-lime-700 mb-4">Job Application Notifications</h3>
          {jobApplicationNotifications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No job application notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobApplicationNotifications.map((application) => (
                <div
                  key={application._id}
                  className={`p-4 border rounded-lg ${getJobApplicationStatusColor(application.status)}`}
                  onClick={() => handleJobApplicationNotificationClick(application.applicantId._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {getJobApplicationStatusMessage(application.status)}
                      </h3>
                      <p className="text-sm mt-1">
                        For: {application.jobId?.title || 'Job Position'}
                      </p>
                      <p className="text-sm">
                        Applicant: {application.applicantId?.firstName} {application.applicantId?.lastName}
                      </p>
                      {application.status === 'workerConfirmation' && application.interviewDate && (
                        <p className="text-sm mt-1">
                          Interview scheduled: {formatDate(application.interviewDate)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs opacity-75 whitespace-nowrap">
                      {formatDate(application.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white">
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worker Job Application Notifications (for Workers) */}
        <div>
          <h3 className="text-xl font-bold text-lime-700 mb-4">My Job Applications</h3>
          {workerJobApplicationNotifications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No job application updates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workerJobApplicationNotifications.map((application) => (
                <div
                  key={application._id}
                  className={`p-4 border rounded-lg ${getWorkerJobApplicationStatusColor(application.status)}`}
                  onClick={() => handleWorkerJobApplicationNotificationClick(application._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {getWorkerJobApplicationStatusMessage(application.status)}
                      </h3>
                      <p className="text-sm mt-1">
                        Position: {application.jobId?.title || 'Job Position'}
                      </p>
                      <p className="text-sm">
                        Company: {application.employerId?.companyName || application.employerId?.firstName + ' ' + application.employerId?.lastName}
                      </p>
                      {application.interviewDate && (
                        <p className="text-sm mt-1">
                          Interview scheduled: {formatDate(application.interviewDate)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs opacity-75 whitespace-nowrap">
                      {formatDate(application.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white">
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;