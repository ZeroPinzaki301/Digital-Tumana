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
          setEnrollment(null);
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
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Welcome Section */}
        <div className="w-full md:w-1/2 bg-lime-600 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-white md:text-6xl tracking-widest ">TESDA COURSE</h1>

          <img
            src={digitalTumanaIcon}
            alt="Digital Tumana Icon"
            className="mx-auto mt-4 w-24 h-24 md:w-50 md:h-50"
          />
          <h2 className="font-sans text-4xl font-bold text-white mt-2 tracking-wider">Digital Tumana</h2>
        </div>

        {/* Right: Enrollment Form or Message */}
        <div className="w-full md:w-1/2 p-6">
          {enrollment ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-lime-700">Enrollment Submitted</h2>
              <p className="text-gray-700">
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
                className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
              >
                See your enrollment status
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-lime-900 text-center mb-4">Enroll Now</h2>

              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                min="15"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />

              <label className="block text-lg font-medium text-gray-700">Birth Certificate Image</label>
              <input
                type="file"
                name="birthCertImage"
                accept="image/*"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:ring-2 hover:ring-lime-400 transition"
              />

              <label className="block text-lg font-medium text-gray-700">Valid ID Image</label>
              <input
                type="file"
                name="validIdImage"
                accept="image/*"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:ring-2 hover:ring-lime-400 transition"
              />

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              {message && <p className="text-green-600 text-sm text-center">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold shadow-md transition ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-lime-700 text-white hover:bg-lime-600/75 hover:text-lime-900 cursor-pointer"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Enrollment"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TesdaEnroll;
