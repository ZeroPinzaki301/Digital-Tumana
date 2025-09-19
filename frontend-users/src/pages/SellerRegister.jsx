import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const SellerRegister = () => {
  const [user, setUser] = useState(null);
  const [defaultIdCard, setDefaultIdCard] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    birthdate: "",
    nationality: "",
    agreedToPolicy: false,
    agreedToTerms: false,
    validId: null,
    secondValidId: null,
    dtiCert: null,
    birCert: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [validIdPreview, setValidIdPreview] = useState(null);
  const [secondValidIdPreview, setSecondValidIdPreview] = useState(null);
  const [dtiCertPreview, setDtiCertPreview] = useState(null);
  const [birCertPreview, setBirCertPreview] = useState(null);
  const [usingDefaultId, setUsingDefaultId] = useState(false);
  
  const navigate = useNavigate();

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
      (formData.validId || usingDefaultId) &&
      formData.dtiCert &&
      formData.birCert
    );
  };

  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchUserAndDefaultId = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
        
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          firstName: res.data.firstName || "",
          middleName: res.data.middleName || "",
          lastName: res.data.lastName || "",
          birthdate: formatDateForInput(res.data.birthdate) || "", // Format the date
          sex: res.data.sex || "",
          nationality: "Filipino",
        }));

        // Fetch default ID card if exists
        try {
          const idRes = await axiosInstance.get("/api/default-id", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          if (idRes.data.defaultIdCard) {
            setDefaultIdCard(idRes.data.defaultIdCard);
            
            // Pre-fill ID fields with URLs
            setFormData(prev => ({
              ...prev,
              validId: idRes.data.defaultIdCard.idImage,
              secondValidId: idRes.data.defaultIdCard.secondIdImage || null
            }));
            
            // Set image previews
            setValidIdPreview(idRes.data.defaultIdCard.idImage);
            if (idRes.data.defaultIdCard.secondIdImage) {
              setSecondValidIdPreview(idRes.data.defaultIdCard.secondIdImage);
            }
            
            setUsingDefaultId(true);
          }
        } catch (idErr) {
          // Default ID card doesn't exist, which is fine
          console.log("No default ID card found");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    fetchUserAndDefaultId();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
      setUsingDefaultId(false);
      
      // Create preview for newly uploaded file
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (name === "validId") {
            setValidIdPreview(e.target.result);
          } else if (name === "secondValidId") {
            setSecondValidIdPreview(e.target.result);
          } else if (name === "dtiCert") {
            setDtiCertPreview(e.target.result);
          } else if (name === "birCert") {
            setBirCertPreview(e.target.result);
          }
        };
        reader.readAsDataURL(files[0]);
      }
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUseDefaultId = () => {
    if (defaultIdCard) {
      setFormData(prev => ({
        ...prev,
        validId: defaultIdCard.idImage,
        secondValidId: defaultIdCard.secondIdImage || null
      }));
      
      setValidIdPreview(defaultIdCard.idImage);
      if (defaultIdCard.secondIdImage) {
        setSecondValidIdPreview(defaultIdCard.secondIdImage);
      }
      
      setUsingDefaultId(true);
    }
  };

  const handleRemoveFile = (type) => {
    if (type === "validId") {
      setFormData({ ...formData, validId: null });
      setValidIdPreview(null);
      setUsingDefaultId(false);
    } else if (type === "secondValidId") {
      setFormData({ ...formData, secondValidId: null });
      setSecondValidIdPreview(null);
      setUsingDefaultId(false);
    } else if (type === "dtiCert") {
      setFormData({ ...formData, dtiCert: null });
      setDtiCertPreview(null);
    } else if (type === "birCert") {
      setFormData({ ...formData, birCert: null });
      setBirCertPreview(null);
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
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        // For file inputs, handle differently
        if (key === "validId" || key === "secondValidId") {
          // If using default ID, we have URLs, not files
          if (usingDefaultId && typeof value === "string") {
            // Append the URL as a regular field
            payload.append(key, value);
          } 
          // If not using default ID and we have a file, append it
          else if (!usingDefaultId && value instanceof File) {
            payload.append(key, value);
          }
        } 
        // For certificate files
        else if ((key === "dtiCert" || key === "birCert") && value instanceof File) {
          payload.append(key, value);
        }
        // For all other fields
        else if (value !== "" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      
      // Add flag to indicate if using default ID
      payload.append("usingDefaultId", usingDefaultId.toString());

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

  const getFileName = (file) => {
    if (!file) return "No file selected";
    if (typeof file === "string") return "Using default ID";
    return file.name;
  };

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

  // File upload component with preview
  const FileUploadWithPreview = ({ name, label, required, preview, onRemove }) => {
    const isIdFile = name === "validId" || name === "secondValidId";
    
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block w-full text-center py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-500/75 cursor-pointer transition mb-2">
          {label}
        </label>
        <input
          type="file"
          name={name}
          id={name}
          onChange={handleChange}
          className="hidden"
          required={required && !(isIdFile && usingDefaultId)}
        />
        
        {preview ? (
          <div className="mt-2 relative">
            <img 
              src={preview} 
              alt={`${name} preview`} 
              className="w-full max-w-xs h-auto border rounded-md mx-auto"
            />
            <button
              type="button"
              onClick={() => onRemove(name)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ×
            </button>
          </div>
        ) : (
          !(isIdFile && usingDefaultId) && (
            <p className="text-sm text-gray-600 mt-1 text-center italic">
              Click above to upload file
            </p>
          )
        )}
        
        <p className="text-sm text-gray-600 mt-1 text-center italic">
          {getFileName(formData[name])}
        </p>
      </div>
    );
  };

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

        {defaultIdCard && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 mb-2">
              You have a default ID card saved. You can use it or upload new documents.
            </p>
            <button
              type="button"
              onClick={handleUseDefaultId}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            >
              Use My Default ID
            </button>
          </div>
        )}

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
              className="mx-2 w-[80%] bg-lime-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
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
              className="mx-2 w-[80%] bg-lime-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
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
              className="mx-2 w-[80%] bg-lime-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
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
              className="mx-2 w-[80%] bg-lime-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1"
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
              className="mx-2 w-[80%] bg-lime-300/50 py-1 px-1.5 rounded-sm input cursor-pointer mt-1" 
            />
          </div>

        </div>

        <hr className="my-4" />

        <div className="space-y-4">
          <FileUploadWithPreview
            name="validId"
            label="Upload Valid ID (Primary)"
            required={true}
            preview={validIdPreview}
            onRemove={handleRemoveFile}
          />
          
          <FileUploadWithPreview
            name="secondValidId"
            label="Upload Second Valid ID (Optional)"
            required={false}
            preview={secondValidIdPreview}
            onRemove={handleRemoveFile}
          />
          
          <FileUploadWithPreview
            name="dtiCert"
            label="Upload DTI Certificate"
            required={true}
            preview={dtiCertPreview}
            onRemove={handleRemoveFile}
          />
          
          <FileUploadWithPreview
            name="birCert"
            label="Upload BIR Certificate"
            required={true}
            preview={birCertPreview}
            onRemove={handleRemoveFile}
          />

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
          disabled={!isFormValid() || isSubmitting}
          className={`w-full mt-4 py-2 rounded-lg transition ${
            (!isFormValid() || isSubmitting) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-lime-700 text-white hover:bg-lime-500/75 hover:text-lime-900 cursor-pointer"
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
