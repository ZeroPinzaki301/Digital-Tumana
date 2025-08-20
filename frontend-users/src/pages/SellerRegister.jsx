import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const SellerRegister = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    age: "",
    birthdate: "",
    nationality: "",
    agreedToPolicy: false,
    validId: null,
    dtiCert: null,
    birCert: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
      } catch (err) {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToPolicy) {
      return setError("You must agree to the policy before submitting.");
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      const res = await axiosInstance.post("/api/sellers/register", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setError("");
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileName = (file) => (file ? file.name : "No file selected");

  return (
    <div className="min-h-screen bg-bg-50 flex flex-col items-center justify-center px-4 py-6">
      {/* Back Button */}
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate("/account")}
          className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-lime-900 transition w-full sm:w-auto"
        >
          ⬅ Back to Account
        </button>
      </div>

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-lg w-full rounded-lg p-6 shadow-md border border-lime-700"
      >
        <h2 className="text-2xl font-bold text-lime-900 mb-4 text-center">Seller Registration</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} className="input cursor-pointer" />
          <input name="middleName" placeholder="Middle Name (Optional)" value={formData.middleName} onChange={handleChange} className="input cursor-pointer" />
          <input name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} className="input cursor-pointer" />
          <select name="sex" required value={formData.sex} onChange={handleChange} className="input cursor-pointer">
            <option value="">Select Sex</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input type="number" name="age" placeholder="Age" required value={formData.age} onChange={handleChange} className="input cursor-pointer" />
          <input type="date" name="birthdate" required value={formData.birthdate} onChange={handleChange} className="input cursor-pointer" />
          <input name="nationality" placeholder="Nationality" required value={formData.nationality} onChange={handleChange} className="input cursor-pointer" />
        </div>

        <hr className="my-4" />

        <div className="space-y-4">
          {[
            { name: "validId", label: "Upload Valid ID", required: true },
            { name: "dtiCert", label: "Upload DTI Certificate", required: true },
            { name: "birCert", label: "Upload BIR Certificate", required: true },
          ].map(({ name, label, required }) => (
            <div key={name}>
              <label htmlFor={name} className="block w-full text-center py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-500/75 cursor-pointer transition">
                {label}
              </label>
              <input
                type="file"
                name={name}
                id={name}
                onChange={handleChange}
                className="hidden"
                required={required}
              />
              <p className="text-sm text-gray-600 mt-1 text-center italic">{getFileName(formData[name])}</p>
            </div>
          ))}

          <label className="flex items-center mt-2 cursor-pointer">
            <input type="checkbox" name="agreedToPolicy" checked={formData.agreedToPolicy} onChange={handleChange} className="mr-2 cursor-pointer" />
            I agree to the Seller Policy
          </label>
        </div>

        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 text-center">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-4 py-2 rounded-lg transition ${
            isSubmitting ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-lime-700 text-white hover:bg-lime-500/75 hover:text-lime-900 cursor-pointer"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg relative text-center border border-lime-700">
            <h3 className="text-xl font-bold text-lime-700 mb-2">Seller Application Complete</h3>
            <p className="text-gray-700 mb-4">
              Thank you for submitting your application. Please wait a few days while we verify your documents.
            </p>
            <button onClick={() => navigate("/account")} className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-500/75 hover:text-lime-900 transition cursor-pointer">
              Back to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRegister;
