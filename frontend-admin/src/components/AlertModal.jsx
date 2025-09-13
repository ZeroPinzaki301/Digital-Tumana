import React from "react";

const AlertModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 w-full max-w-sm mx-auto">
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-sky-400 to-blue-600 rounded-t-xl"></div>

        {/* Modal Content */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-sky-900 mb-2">Notice</h2>
          <p className="text-sky-700 mb-4">{message}</p>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            OK
          </button>
        </div>

        {/* Bottom Footer */}
        <div className="bg-sky-50 p-3 text-center border-t border-sky-100 rounded-b-xl">
          <p className="text-xs text-sky-700">Digital Tumana System Alert</p>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;