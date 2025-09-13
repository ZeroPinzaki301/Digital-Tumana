import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const EmployerRegister = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    birthdate: "",
    nationality: "",
    companyName: "",
    agreedToPolicy: false,
    agreedToTerms: false,
    validId: null,
    dtiCert: null,
    birCert: null,
  });

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.sex &&
      formData.birthdate &&
      formData.nationality &&
      formData.agreedToPolicy &&
      formData.agreedToTerms &&
      formData.validId
    );
  };


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
        
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          middleName: res.data.middleName || "",
          nationality: "Filipino",
        }));
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
      return setError("You must agree to the Employer Policy and Terms and Conditions before submitting.");
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      const res = await axiosInstance.post("/api/employers/register", payload, {
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

  // Get today's date in YYYY-MM-DD format for the max date attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="min-h-screen bg-bg-50 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate("/account")}
          className="py-2 px-4 bg-sky-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition w-full sm:w-auto"
        >
          ⬅ Back to Account
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-lg w-full rounded-lg p-6 shadow-md border border-lime-700"
      >
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Employer Registration</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-sky-900">First Name</label>
            <input 
              id="firstName"
              name="firstName" 
              placeholder="First Name" 
              required 
              value={formData.firstName} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>

          <div>
            <label htmlFor="middleName" className="text-sm font-medium text-sky-900">Middle Name (Optional)</label>
            <input 
              id="middleName"
              name="middleName" 
              placeholder="Middle Name" 
              value={formData.middleName} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>

          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-sky-900">Last Name</label>
            <input 
              id="lastName"
              name="lastName" 
              placeholder="Last Name" 
              required 
              value={formData.lastName} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>

          <div className="flex">
            <label htmlFor="sex" className="text-sm font-medium text-sky-900">Sex</label>
            <select 
              id="sex"
              name="sex" 
              required 
              value={formData.sex} 
              onChange={handleChange} 
              className="mx-2 input cursor-pointer mt-6"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="birthdate" className="text-sm font-medium text-sky-900">Birthdate</label>
            <input 
              type="date" 
              id="birthdate"
              name="birthdate" 
              required 
              value={formData.birthdate} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1"
              max={getTodayDate()} 
            />
            {formData.birthdate && (
              <p className="text-sm text-gray-600 mt-1">
                Age: {calculateAge(formData.birthdate)} years old
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nationality" className="text-sm font-medium text-sky-900">Nationality</label>
            <input 
              id="nationality"
              name="nationality" 
              placeholder="Nationality" 
              required 
              value={formData.nationality} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="text-sm font-medium text-sky-900">Company Name</label>
            <input 
              id="companyName"
              name="companyName" 
              placeholder="Company Name" 
              required 
              value={formData.companyName} 
              onChange={handleChange} 
              className="mx-2 w-[80%] bg-sky-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="space-y-4">
          {[
            { name: "validId", label: "Upload Valid ID (Primary)", required: true },
            { name: "secondValidId", label: "Upload another ID (Secondary))", required: true },
            { name: "dtiCert", label: "Upload DTI Certificate", required: false },
            { name: "birCert", label: "Upload BIR Certificate", required: false },
          ].map(({ name, label, required }) => (
            <div key={name}>
              <label htmlFor={name} className="block w-full text-center py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500/75 cursor-pointer transition">
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
            <span onClick={() => setShowPolicyModal(true)} className="text-sky-700 underline">I agree to the Employer Privacy Policy</span>
          </label>

          <label className="flex items-center mt-2 cursor-pointer">
            <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mr-2 cursor-pointer" />
            <span onClick={() => setShowTermsModal(true)} className="text-sky-700 underline">I agree to the Terms and Conditions</span>
          </label>
        </div>

        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 text-center">{message}</p>}

        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`w-full mt-4 py-2 rounded-lg transition ${
            (!isFormValid() || isSubmitting) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-sky-700 text-white hover:bg-sky-500/75 hover:text-sky-900 cursor-pointer"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg relative text-center border border-lime-700">
            <h3 className="text-xl font-bold text-lime-700 mb-2">Employer Application Complete</h3>
            <p className="text-gray-700 mb-4">
              Thank you for submitting your application. Please wait a few days while we verify your documents.
            </p>
            <button onClick={() => navigate("/account")} className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition cursor-pointer">
              Back to Profile
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-sky-700 mb-4">Employer Privacy Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>This policy outlines how Digital Tumana collects, uses, and protects employer data.</p>
              <p><strong>Data Collection:</strong> We collect personal and company information for verification and platform use.</p>
              <p><strong>Document Requirements:</strong> Employers must submit a valid ID and may optionally upload DTI and BIR certificates.</p>
              <p><strong>Usage:</strong> Submitted data is used for account verification, job posting, and communication purposes.</p>
              <p><strong>Security:</strong> All data is securely stored and protected against unauthorized access.</p>
              <p><strong>Policy Updates:</strong> We may update this policy. Employers will be notified of changes via email or platform alerts.</p>
            </div>
            <button onClick={() => setShowPolicyModal(false)} className="mt-6 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-sky-700 mb-4">Terms and Conditions</h2>
            <div className="text-gray-700 space-y-4">
              <p>By registering as an employer on Digital Tumana, you agree to the following terms:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>All submitted information must be accurate and truthful.</li>
                <li>You agree to comply with platform rules and employment standards.</li>
                <li>Misuse of the platform may result in account suspension or termination.</li>
                <li>You consent to the processing of your data for verification and operational purposes.</li>
                <li>Digital Tumana reserves the right to update these terms at any time.</li>
              </ul>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="mt-6 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerRegister;