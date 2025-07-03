import { useNavigate } from "react-router-dom";

const PendingSellerNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md text-center border border-lime-700">
        <h2 className="text-2xl font-bold text-lime-700 mb-2">
          Seller Application Pending
        </h2>
        <p className="text-gray-700 mb-4">
          You already have a pending seller registration. Please wait while we verify your application. We'll notify you once a decision has been made.
        </p>
        <button
          onClick={() => navigate("/account")}
          className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
        >
          Back to Account
        </button>
      </div>
    </div>
  );
};

export default PendingSellerNotice;