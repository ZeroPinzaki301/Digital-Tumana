import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const WorkerRegister = () => {
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
    resumeFile: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [validIdPreview, setValidIdPreview] = useState(null);
  const [secondValidIdPreview, setSecondValidIdPreview] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [usingDefaultId, setUsingDefaultId] = useState(false);

  const navigate = useNavigate();

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.sex &&
      formData.birthdate &&
      formData.nationality &&
      formData.agreedToPolicy &&
      formData.agreedToTerms &&
      (formData.validId || usingDefaultId)
    );
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchUserAndDefaultId = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
        setFormData(prev => ({
          ...prev,
          firstName: res.data.firstName || "",
          middleName: res.data.middleName || "",
          lastName: res.data.lastName || "",
          birthdate: formatDateForInput(res.data.birthdate) || "",
          sex: res.data.sex || "",
          nationality: "Filipino",
        }));

        const idRes = await axiosInstance.get("/api/default-id", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (idRes.data.defaultIdCard) {
          setDefaultIdCard(idRes.data.defaultIdCard);
          setFormData(prev => ({
            ...prev,
            validId: idRes.data.defaultIdCard.idImage,
            secondValidId: idRes.data.defaultIdCard.secondIdImage || null
          }));
          setValidIdPreview(idRes.data.defaultIdCard.idImage);
          if (idRes.data.defaultIdCard.secondIdImage) {
            setSecondValidIdPreview(idRes.data.defaultIdCard.secondIdImage);
          }
          setUsingDefaultId(true);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        if (name === "validId") setValidIdPreview(e.target.result);
        else if (name === "secondValidId") setSecondValidIdPreview(e.target.result);
        else if (name === "resumeFile") setResumePreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
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
    setFormData(prev => ({ ...prev, [type]: null }));
    if (type === "validId") {
      setValidIdPreview(null);
      setUsingDefaultId(false);
    } else if (type === "secondValidId") {
      setSecondValidIdPreview(null);
      setUsingDefaultId(false);
    } else if (type === "resumeFile") setResumePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreedToPolicy || !formData.agreedToTerms) {
      return setError("You must agree to the Worker Policy and Terms and Conditions before submitting.");
    }
    if (!formData.validId && !usingDefaultId) {
      return setError("Please upload a valid ID or use your default ID.");
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if ((key === "validId" || key === "secondValidId") && typeof value === "string") {
          payload.append(key, value);
        } else if (value instanceof File) {
          payload.append(key, value);
        } else if (value !== "" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      payload.append("usingDefaultValidId", usingDefaultId.toString());

      const res = await axiosInstance.post("/api/workers/register", payload, {
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

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

  const FileUploadWithPreview = ({ name, label, preview, onRemove }) => {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block w-full text-center py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500/75 cursor-pointer transition mb-2">
          {label}
        </label>
        <input
          type="file"
          name={name}
          id={name}
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="mt-2 relative">
            {name === "resumeFile" ? (
              <div className="p-3 border rounded-md bg-gray-100 text-center">
                <p className="text-sm">Resume Preview</p>
                <button 
                  type="button" 
                  onClick={() => window.open(preview, '_blank')}
                  className="text-blue-600 underline text-sm mt-1"
                >
                  View Resume
                </button>
              </div>
            ) : (
              <img src={preview} alt={`${name} preview`} className="w-full max-w-xs h-auto border rounded-md mx-auto" />
            )}
            <button type="button" onClick={() => onRemove(name)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">×</button>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-1 text-center italic">Click above to upload file</p>
        )}
        <p className="text-sm text-gray-600 mt-1 text-center italic">{getFileName(formData[name])}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-50 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate("/account")}
          className="py-2 px-4 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 cursor-pointer hover:text-sky-900 transition w-full sm:w-auto"
        >
          ⬅ Back to Account
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-lg w-full rounded-lg p-6 shadow-md border border-sky-700"
      >
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Worker Registration</h2>

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
        </div>

        <hr className="my-4" />

        <div className="space-y-4">
          <FileUploadWithPreview
            name="validId"
            label="Upload Valid ID (Primary)"
            preview={validIdPreview}
            onRemove={handleRemoveFile}
          />
          
          <FileUploadWithPreview
            name="secondValidId"
            label="Upload Another ID (Secondary)"
            preview={secondValidIdPreview}
            onRemove={handleRemoveFile}
          />
          
          <FileUploadWithPreview
            name="resumeFile"
            label="Upload Resume (Optional)"
            preview={resumePreview}
            onRemove={handleRemoveFile}
          />

          <label className="flex items-center mt-2 cursor-pointer">
            <input type="checkbox" name="agreedToPolicy" checked={formData.agreedToPolicy} onChange={handleChange} className="mr-2 cursor-pointer" />
            <span onClick={() => setShowPolicyModal(true)} className="text-sky-700 underline">I agree to the Worker Policy</span>
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
          <div className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg relative text-center border border-sky-700">
            <h3 className="text-xl font-bold text-sky-700 mb-2">Worker Application Complete</h3>
            <p className="text-gray-700 mb-4">
              Thank you for submitting your application. Please wait a few days while we verify your documents.
            </p>
            <button onClick={() => navigate("/account")} className="w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500/75 hover:text-sky-900 transition cursor-pointer">
              Back to Profile
            </button>
          </div>
        </div>
      )}

      {/* Worker Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-sky-700 mb-4">Worker Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>This policy outlines the responsibilities and expectations for individuals registering as workers on our platform.</p>
              <p><strong>Identity Verification:</strong> All workers must submit valid personal information and a government-issued ID.</p>
              <p><strong>Document Requirements:</strong> Workers must upload a valid ID and may optionally submit a resume.</p>
              <p><strong>Compliance:</strong> Workers are expected to adhere to platform guidelines and fulfill assigned tasks reliably.</p>
              <p><strong>Data Protection:</strong> All submitted information is securely stored and used only for verification and operational purposes.</p>
              <p><strong>Policy Updates:</strong> This policy may be updated periodically. Workers will be notified of changes.</p>
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
              <p>By registering as a worker, you agree to the following terms and conditions:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>You confirm that all information provided is accurate and truthful.</li>
                <li>You agree to comply with all platform rules and regulations.</li>
                <li>You understand that failure to meet work expectations may result in account suspension or termination.</li>
                <li>You consent to the processing of your personal data for verification and employment purposes.</li>
                <li>You acknowledge that this platform reserves the right to update policies and terms at any time.</li>
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

export default WorkerRegister;
