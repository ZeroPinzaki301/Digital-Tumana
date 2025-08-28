import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const FeedbackForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    senderName: "",
    subject: "Report",
    customSubject: "",
    message: "",
    email: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData((prev) => ({
          ...prev,
          senderName: `${res.data.firstName} ${res.data.lastName}`,
          email: res.data.email || "",
        }));
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post("/api/feedbacks", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Feedback submitted!");
      setFormData({
        senderName: formData.senderName,
        subject: "Report",
        customSubject: "",
        message: "",
        email: formData.email,
      });
      navigate("/account");
    } catch (err) {
      console.error("Submission failed", err);
      alert("Failed to submit feedback.");
    }
  };

  if (isLoading)
    return <div className="text-center mt-10 text-lime-600 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg border border-lime-600 transition-all duration-300">
      <h2 className="text-3xl font-extrabold text-lime-800 mb-6 text-center">Send Feedback</h2>

      <button
        onClick={() => navigate("/account")}
        className="cursor-pointer mb-6 text-lime-700 hover:text-lime-900 font-medium underline transition duration-200"
      >
        ← Back to Account
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-lime-800">Subject</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-lime-600 rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="Report">Report</option>
            <option value="Suggestion">Suggestion</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {formData.subject === "Others" && (
          <div>
            <label className="block text-sm font-semibold text-lime-800">Custom Subject</label>
            <input
              type="text"
              name="customSubject"
              value={formData.customSubject}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-lime-600 rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
              placeholder="Enter your subject"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-lime-800">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-lime-600 rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
            rows="5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-lime-800">Email (optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-lime-600 rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded transition duration-300 shadow-md hover:shadow-lg"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
