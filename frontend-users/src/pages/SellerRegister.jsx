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
    agreedToTerms: false,
    validId: null,
    dtiCert: null,
    birCert: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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

    if (!formData.agreedToPolicy || !formData.agreedToTerms) {
      return setError("You must agree to the Seller Policy and Terms and Conditions before submitting.");
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
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate("/account")}
          className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-lime-900 transition w-full sm:w-auto"
        >
          ⬅ Back to Account
        </button>
      </div>

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
            <span onClick={() => setShowPolicyModal(true)} className="text-lime-700 underline">I agree to the Seller Privacy Policy</span>
          </label>

          <label className="flex items-center mt-2 cursor-pointer">
            <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mr-2 cursor-pointer" />
            <span onClick={() => setShowTermsModal(true)} className="text-lime-700 underline">I agree to the Terms and Conditions</span>
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

      {/* Success Modal */}
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

      {/* Seller Privacy Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-lime-700 mb-4">Seller Privacy Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>This policy outlines how Digital Tumana collects, uses, and protects seller data.</p>
              <p><strong>Data Collection:</strong> We collect personal and business information for verification and marketplace operations.</p>
              <p><strong>Document Requirements:</strong> Sellers must submit a valid ID, DTI certificate, and BIR certificate to ensure legitimacy.</p>
              <p><strong>Usage:</strong> Data is used for account verification, product listing, and communication with buyers.</p>
              <p><strong>Security:</strong> All data is securely stored and protected against unauthorized access.</p>
              <p><strong>Policy Updates:</strong> We may update this policy. Sellers will be notified of changes via email or platform alerts.</p>
            </div>
            <button onClick={() => setShowPolicyModal(false)} className="mt-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-lime-700 mb-4">Terms and Conditions</h2>
            <div className="text-gray-700 space-y-4">
              <p>By registering as a seller on Digital Tumana, you agree to the following terms:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>All submitted information must be accurate and truthful.</li>
                <li>You agree to comply with marketplace rules and product standards.</li>
                <li>Misrepresentation or fraudulent activity may result in account suspension or termination.</li>
                <li>You consent to the processing of your data for verification and operational purposes.</li>
                <li>Digital Tumana reserves the right to update these terms at any time.</li>
              </ul>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="mt-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRegister;
