import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const TesdaEnrollmentStatus = () => {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bachelor, setBachelor] = useState(null);
  const [bachelorLoading, setBachelorLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const res = await axiosInstance.get("/api/tesda/enroll", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEnrollment(res.data.enrollment);
      } catch (err) {
        setError("Failed to fetch enrollment status.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, []);

  useEffect(() => {
    const fetchBadge = async () => {
      if (enrollment?.status === "graduated") {
        try {
          const res = await axiosInstance.get("/api/tesda/badge", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setBachelor(res.data.badge);
        } catch (err) {
          setBachelor(null); // no badge yet
        } finally {
          setBachelorLoading(false);
        }
      }
    };

    fetchBadge();
  }, [enrollment]);

  const handleReRegister = async () => {
    try {
      await axiosInstance.delete("/api/tesda/enroll", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/learn/tesda/enroll");
    } catch (err) {
      alert("Failed to reset enrollment. Please try again.");
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("profilePicture", profileImage);

    try {
      const res = await axiosInstance.post("/api/tesda/badge", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setBachelor(res.data.badge);
    } catch (err) {
      alert("Failed to create badge. Please try again.");
    }
  };

  const renderStatusMessage = () => {
    switch (enrollment.status) {
      case "pending":
        return (
          <>
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Status: Pending</h2>
            <p className="text-gray-700 text-lg mb-6">
              Your enrollment is currently pending. Please wait while our admins verify your credentials.
            </p>
          </>
        );
      case "eligible":
        return (
          <>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Status: Eligible</h2>
            <p className="text-gray-700 text-lg mb-6">
              Your documents have been verified and deemed eligible. Please wait while we reserve your slot.
            </p>
          </>
        );
      case "reserved":
        return (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Status: Reserved</h2>
            <p className="text-gray-700 text-lg mb-4">
              🎉 Congratulations! You’ve successfully reserved a slot in our TESDA course.
            </p>
            <div className="text-left text-gray-700 space-y-2 mb-6">
              <p><strong>📅 Date:</strong> August 25, 2025</p>
              <p><strong>📍 Location:</strong> Tumana Community Center, Marikina</p>
              <p><strong>📞 Contact:</strong> 0917-123-4567</p>
              <p><strong>📧 Email:</strong> digitaltumana@gmail.com</p>
              <p><strong>📘 Facebook:</strong> fb.com/digitaltumana</p>
            </div>
          </>
        );
      case "enrolled":
        return (
          <>
            <h2 className="text-2xl font-bold text-lime-700 mb-4">Status: Enrolled</h2>
            <p className="text-gray-700 text-lg mb-6">
              You are currently enrolled in our TESDA course. We’re excited to have you onboard!
            </p>
            <p className="text-gray-600 text-md">
              Stay tuned for updates and announcements. You may also join our community page for discussions and support.
            </p>
          </>
        );
      case "cancelled":
        return (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Status: Cancelled</h2>
            <p className="text-gray-700 text-lg mb-6">
              Your enrollment was cancelled due to various reasons. You may re-register by clicking the button below.
            </p>
            <button
              onClick={handleReRegister}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition mb-4"
            >
              Re-register
            </button>
          </>
        );
      case "graduated":
        return (
          <>
            <h2 className="text-2xl font-bold text-purple-700 mb-4">🎓 Status: Graduated</h2>
            <p className="text-gray-700 text-lg mb-4">
              Congratulations on completing your TESDA course! You’re now eligible to create your official Tumana Bachelor badge.
            </p>

            {bachelorLoading ? (
              <p className="text-gray-500">Checking badge status...</p>
            ) : bachelor ? (
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={bachelor.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                />
                <p className="text-lg text-gray-800 font-semibold">
                  {bachelor.firstName} {bachelor.lastName}
                </p>
                <p className="text-sm text-gray-600">Badge created on {new Date(bachelor.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBadge} className="flex flex-col items-center space-y-4 mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="border p-2 rounded w-full max-w-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition"
                >
                  Create My Badge
                </button>
              </form>
            )}
          </>
        );
      default:
        return <p className="text-gray-700">Unknown status.</p>;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-600 text-lg mb-4">{error || "No enrollment found."}</p>
        <button
          onClick={() => navigate("/learn")}
          className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
        >
          Back to Learn
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4 text-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
        {renderStatusMessage()}
        <button
          onClick={() => navigate("/learn")}
          className="mt-6 bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
        >
          Back to Learn
        </button>
      </div>
    </div>
  );
};

export default TesdaEnrollmentStatus;