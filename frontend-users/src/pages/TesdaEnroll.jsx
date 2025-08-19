import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate } from "react-router-dom";

const TesdaEnroll = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    birthdate: "",
    birthCertImage: null,
    validIdImage: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔐 Fetch user info and enrollment
  useEffect(() => {
    const fetchUserAndEnrollment = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        setFormData((prev) => ({
          ...prev,
          firstName: userRes.data.firstName || "",
          lastName: userRes.data.lastName || "",
          birthdate: userRes.data.birthdate?.slice(0, 10) || "",
        }));

        const enrollmentRes = await axiosInstance.get("/api/tesda/enroll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollment(enrollmentRes.data.enrollment);
      } catch (err) {
        if (err.response?.status === 404) {
          setEnrollment(null); // No enrollment yet
        } else {
          navigate("/login");
        }
      }
    };

    fetchUserAndEnrollment();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    try {
      const res = await axiosInstance.post("/api/tesda/enroll", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(res.data.message);
      setError("");
      navigate("/learn/tesda/enroll/status");
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-lime-700 md:text-4xl">TESDA Enrollment</h1>
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana Icon"
          className="mx-auto mt-2 w-20 h-20 md:w-32 md:h-32"
        />
        <h2 className="font-sans text-xl font-bold text-lime-700 md:text-2xl">
          Digital Tumana
        </h2>
      </div>

      {/* Already Enrolled Message */}
      {enrollment ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-lime-700 mb-4">Enrollment Submitted</h2>
          <p className="text-gray-700 mb-4">
            You have already submitted a TESDA enrollment form. Please wait for confirmation.
          </p>
          <button
            onClick={() => navigate("/learn")}
            className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            Back to Learn
          </button>
          <button
            onClick={() => navigate("/learn/tesda/enroll/status")}
            className="w-full mt-3 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
          >
            See your enrollment status
          </button>
        </div>
      ) : (
        // Enrollment Form
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-lime-700 text-center mb-4">Enroll Now</h2>

          <div className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="input"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input"
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              min="15"
              value={formData.age}
              onChange={handleChange}
              required
              className="input"
            />
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              className="input"
            />
            <label className="block text-lg font-medium text-gray-700">Birth Certificate Image</label>
            <input
              type="file"
              name="birthCertImage"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full"
            />
            <label className="block text-lg font-medium text-gray-700">Valid ID Image</label>
            <input
              type="file"
              name="validIdImage"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full"
            />

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {message && <p className="text-green-600 text-sm text-center">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-lg transition ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-lime-700 text-white hover:bg-lime-800"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Enrollment"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TesdaEnroll;