import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import { useNavigate } from "react-router-dom";

const TesdaEnroll = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [defaultIdCard, setDefaultIdCard] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthdate: "",
    birthCertImage: null,
    validIdImage: null,
    secondValidIdImage: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [birthCertPreview, setBirthCertPreview] = useState(null);
  const [validIdPreview, setValidIdPreview] = useState(null);
  const [secondValidIdPreview, setSecondValidIdPreview] = useState(null);
  const [usingDefaultId, setUsingDefaultId] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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
          middleName: userRes.data.middleName || "",
          lastName: userRes.data.lastName || "",
          birthdate: userRes.data.birthdate?.slice(0, 10) || "",
        }));

        // Fetch default ID card
        try {
          const idRes = await axiosInstance.get("/api/default-id", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (idRes.data.defaultIdCard) {
            setDefaultIdCard(idRes.data.defaultIdCard);
            setFormData(prev => ({
              ...prev,
              validIdImage: idRes.data.defaultIdCard.idImage,
              secondValidIdImage: idRes.data.defaultIdCard.secondIdImage || null
            }));
            setValidIdPreview(idRes.data.defaultIdCard.idImage);
            if (idRes.data.defaultIdCard.secondIdImage) {
              setSecondValidIdPreview(idRes.data.defaultIdCard.secondIdImage);
            }
            setUsingDefaultId(true);
          }
        } catch (idErr) {
          console.log("No default ID card found");
        }

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

  // Check if all required fields are filled
  useEffect(() => {
    const checkFormValidity = () => {
      const { firstName, lastName, birthdate, birthCertImage, validIdImage, secondValidIdImage } = formData;
      return firstName && lastName && birthdate && birthCertImage && validIdImage && secondValidIdImage;
    };
    
    setIsFormValid(checkFormValidity());
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setUsingDefaultId(false);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (name === "birthCertImage") setBirthCertPreview(e.target.result);
        else if (name === "validIdImage") setValidIdPreview(e.target.result);
        else if (name === "secondValidIdImage") setSecondValidIdPreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUseDefaultId = () => {
    if (defaultIdCard) {
      setFormData(prev => ({
        ...prev,
        validIdImage: defaultIdCard.idImage,
        secondValidIdImage: defaultIdCard.secondIdImage || null
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
    if (type === "birthCertImage") setBirthCertPreview(null);
    else if (type === "validIdImage") {
      setValidIdPreview(null);
      setUsingDefaultId(false);
    }
    else if (type === "secondValidIdImage") {
      setSecondValidIdPreview(null);
      setUsingDefaultId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if ((key === "validIdImage" || key === "secondValidIdImage") && typeof value === "string") {
          payload.append(key, value);
        } else if (value instanceof File) {
          payload.append(key, value);
        } else if (value !== "" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      payload.append("usingDefaultValidId", usingDefaultId.toString());

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

  const getFileName = (file) => {
    if (!file) return "No file selected";
    if (typeof file === "string") return "Using default ID";
    return file.name;
  };

  const FileUploadWithPreview = ({ name, label, preview, onRemove }) => {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-lg font-medium text-gray-700 mb-2">{label}</label>
        <label htmlFor={name} className="block w-full text-center py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer transition mb-2">
          Click to Upload
        </label>
        <input
          type="file"
          name={name}
          id={name}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="mt-2 relative">
            <img src={preview} alt={`${name} preview`} className="w-full max-w-xs h-auto border rounded-md mx-auto" />
            <button 
              type="button" 
              onClick={() => onRemove(name)} 
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
              aria-label={`Remove ${label}`}
            >
              ×
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-1 text-center italic">Click above to upload file</p>
        )}
        <p className="text-sm text-gray-600 mt-1 text-center italic">{getFileName(formData[name])}</p>
      </div>
    );
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
                onClick={() => navigate(-1)}
                className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
              >
                Back
              </button>
              <button
                onClick={() => navigate("/learn/tesda/enroll/status")}
                className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
              >
                See your enrollment status
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <h2 className="text-xl font-bold text-lime-900 text-center mb-4">Enroll Now</h2>

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
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
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
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              />

              <FileUploadWithPreview
                name="birthCertImage"
                label="Birth Certificate Image"
                preview={birthCertPreview}
                onRemove={handleRemoveFile}
                required={true}
              />
              
              <FileUploadWithPreview
                name="validIdImage"
                label="Upload a valid ID (Primary)"
                preview={validIdPreview}
                onRemove={handleRemoveFile}
                required={true}
              />
              
              <FileUploadWithPreview
                name="secondValidIdImage"
                label="Upload another ID (Secondary)"
                preview={secondValidIdPreview}
                onRemove={handleRemoveFile}
                required={true}
              />

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              {message && <p className="text-green-600 text-sm text-center">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-3 rounded-lg font-semibold shadow-md transition ${
                  isSubmitting || !isFormValid
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
