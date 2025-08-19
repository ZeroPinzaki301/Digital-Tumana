import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SKILL_TYPES = [
  "Plants", "Fertilizers", "Animals", "Machinery",
  "Irrigation", "Harvesting", "Storage", "Other"
];

const CreatePortfolio = () => {
  const [user, setUser] = useState(null);
  const [workerAddress, setWorkerAddress] = useState(null);
  const [skillTypes, setSkillTypes] = useState([]);
  const [skills, setSkills] = useState([{ skillName: "", skillDescription: "" }]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const navigate = useNavigate();

  // 🔐 Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
      } catch {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // 📍 Fetch worker address and gate page
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axiosInstance.get("/api/workers/address", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data?.address) {
          setWorkerAddress(res.data.address);
        } else {
          setShowAddressModal(true);
        }
      } catch (err) {
        console.error("Failed to fetch worker address:", err);
        setShowAddressModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, []);

  const handleSkillChange = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const addSkill = () => {
    setSkills([...skills, { skillName: "", skillDescription: "" }]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0 || skills.some(s => !s.skillName.trim())) {
      setMessage("Please complete all required skill fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/worker/portfolio", {
        skillTypes,
        skills,
        workerAddress: workerAddress._id,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMessage("Portfolio created successfully!");
      navigate("/worker-dashboard");
    } catch (err) {
      console.error("Error creating portfolio:", err);
      setMessage("Failed to create portfolio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading portfolio setup...</div>;
  }

  return (
    <div className="relative">
      {/* 🛑 Modal if no address */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-2">Missing Worker Address</h3>
            <p className="mb-4 text-sm text-gray-700">
              You do not have a worker address set up. Please create one to proceed.
            </p>
            <button
              onClick={() => navigate("/worker-address")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Address Setup
            </button>
          </div>
        </div>
      )}

      {/* ✅ Portfolio Form */}
      {!showAddressModal && (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-8">
          <h2 className="text-2xl font-bold mb-4">Create Your Portfolio</h2>

          {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Types */}
            <div>
              <label className="block font-medium mb-1">Skill Types</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={type}
                      checked={skillTypes.includes(type)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSkillTypes(prev =>
                          checked ? [...prev, type] : prev.filter(t => t !== type)
                        );
                      }}
                      className="accent-blue-600"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block font-medium mb-2">Skills</label>
              {skills.map((skill, index) => (
                <div key={index} className="mb-3 space-y-1">
                  <input
                    type="text"
                    placeholder="Skill Name"
                    value={skill.skillName}
                    onChange={(e) => handleSkillChange(index, "skillName", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                  <textarea
                    placeholder="Skill Description (optional)"
                    value={skill.skillDescription}
                    onChange={(e) => handleSkillChange(index, "skillDescription", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="text-blue-600 text-sm underline"
              >
                + Add another skill
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Create Portfolio"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreatePortfolio;