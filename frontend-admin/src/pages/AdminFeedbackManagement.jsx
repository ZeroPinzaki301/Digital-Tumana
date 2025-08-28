import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaEye, FaTrash, FaEnvelope, FaUser, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [viewMode, setViewMode] = useState("unseen"); // 'unseen' or 'seen'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [viewMode]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const endpoint = viewMode === "unseen" 
        ? "/api/feedbacks/unseen" 
        : "/api/feedbacks/seen";
      
      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFeedbacks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch feedbacks");
      setLoading(false);
      console.error(err);
    }
  };

  const handleMarkAsSeen = async (feedbackId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(
        `/api/feedbacks/seen/${feedbackId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      if (viewMode === "unseen") {
        setFeedbacks(feedbacks.filter(feedback => feedback._id !== feedbackId));
      } else {
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === feedbackId 
            ? {...feedback, status: "seen"} 
            : feedback
        ));
      }
    } catch (err) {
      console.error("Failed to mark feedback as seen:", err);
      alert("Failed to update feedback status");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.delete(
        `/api/feedbacks/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove from local state
      setFeedbacks(feedbacks.filter(feedback => feedback._id !== feedbackId));
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      alert("Failed to delete feedback");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="flex flex-col items-center">
          <div className="animate-pulse rounded-full h-16 w-16 bg-sky-400 mb-4"></div>
          <div className="text-xl font-semibold text-sky-700">Loading feedbacks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-l-4 border-red-500">
          <div className="text-xl font-semibold text-red-500 mb-2">Error</div>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 px-4 py-8">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 text-sky-800 drop-shadow-md">Feedback Management</h1>
          <p className="text-sky-600">Manage user feedbacks and suggestions</p>
          <div className="mt-4 bg-sky-500 h-1 w-24 mx-auto rounded-full"></div>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                viewMode === "unseen"
                  ? "bg-sky-500 text-white"
                  : "bg-white text-sky-700 hover:bg-gray-100"
              } border border-sky-500`}
              onClick={() => setViewMode("unseen")}
            >
              Unseen Feedbacks
            </button>
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                viewMode === "seen"
                  ? "bg-sky-500 text-white"
                  : "bg-white text-sky-700 hover:bg-gray-100"
              } border border-sky-500`}
              onClick={() => setViewMode("seen")}
            >
              Seen Feedbacks
            </button>
          </div>
        </div>
        
        {feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-sky-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
              <FaEnvelope className="h-8 w-8 text-sky-500" />
            </div>
            <p className="text-lg text-gray-600">
              {viewMode === "unseen" 
                ? "No unseen feedbacks found." 
                : "No seen feedbacks found."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <FeedbackCard 
                key={feedback._id} 
                feedback={feedback} 
                onMarkAsSeen={handleMarkAsSeen}
                onDelete={handleDeleteFeedback}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FeedbackCard = ({ feedback, onMarkAsSeen, onDelete, viewMode }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getSubjectText = () => {
    if (feedback.subject === "Others" && feedback.customSubject) {
      return feedback.customSubject;
    }
    return feedback.subject;
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sky-100 hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mr-4 border-2 border-sky-200">
              <FaUser className="text-sky-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-sky-800">{feedback.senderName}</h3>
              {feedback.email && (
                <p className="text-sky-600 text-sm">{feedback.email}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {viewMode === "unseen" && (
              <button
                onClick={() => onMarkAsSeen(feedback._id)}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Mark as seen"
              >
                <FaEye />
              </button>
            )}
            <button
              onClick={() => onDelete(feedback._id)}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Delete feedback"
            >
              <FaTrash />
            </button>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            feedback.subject === "Bug" 
              ? "bg-red-100 text-red-800" 
              : feedback.subject === "Feature Request"
              ? "bg-purple-100 text-purple-800"
              : feedback.subject === "Suggestion"
              ? "bg-blue-100 text-blue-800"
              : feedback.subject === "Report"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {getSubjectText()}
          </span>
          
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <FaClock className="mr-1" />
            <span>{formatDate(feedback.createdAt)}</span>
            
            <span className="mx-2">•</span>
            
            {feedback.status === "seen" ? (
              <span className="flex items-center text-green-600">
                <FaCheckCircle className="mr-1" /> Seen
              </span>
            ) : (
              <span className="flex items-center text-amber-600">
                <FaTimesCircle className="mr-1" /> Unseen
              </span>
            )}
          </div>
        </div>
        
        <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="pt-4 border-t border-sky-100">
            <h4 className="font-medium text-sky-700 mb-2">Message:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackManagement;