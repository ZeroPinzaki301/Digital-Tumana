import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const OngoingJobDetails = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get(`/api/job-applications/details/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(res.data.application);
      } catch (error) {
        console.error('Error fetching job details:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [applicationId]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading job details...</div>;
  }

  if (!application) {
    return <div className="text-center py-10 text-red-500">Job application not found.</div>;
  }

  const { jobId, employerId } = application;
  const address = employerId?.employerAddress;

  return (
    <div className="bg-blue-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white border border-sky-700 rounded-md shadow hover:bg-sky-100 cursor-pointer text-sky-800 font-medium transition"
        >
          ← Back
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-sky-800 mb-6 text-center">Ongoing Job Details</h2>

      {/* Job Info */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 text-sky-700">Job Information</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <img src={jobId?.jobImage} alt="Job" className="w-32 h-32 object-cover rounded" />
          <div>
            <p><strong>Name:</strong> {jobId?.jobName}</p>
            <p><strong>Description:</strong> {jobId?.jobDescription}</p>
            <p><strong>Salary:</strong> ₱{jobId?.minSalary} - ₱{jobId?.maxSalary} ({jobId?.salaryFrequency})</p>
            <p><strong>Code:</strong> {jobId?.jobCode}</p>
          </div>
        </div>
      </section>

      {/* Employer Info */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 text-sky-700">Employer Information</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <img src={employerId?.profilePicture} alt="Employer" className="w-16 h-16 rounded-full object-cover" />
          <div>
            <p><strong>Name:</strong> {employerId?.firstName} {employerId?.lastName}</p>
            <p><strong>Email:</strong> {employerId?.email}</p>
            <p><strong>Company:</strong> {employerId?.companyName}</p>
          </div>
        </div>
      </section>

      {/* Employer Address */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 text-sky-700">Employer Address</h3>
        {address ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p><strong>Region:</strong> {address.region}</p>
            <p><strong>Province:</strong> {address.province}</p>
            <p><strong>City/Municipality:</strong> {address.cityOrMunicipality}</p>
            <p><strong>Barangay:</strong> {address.barangay}</p>
            <p><strong>Street:</strong> {address.street}</p>
            <p><strong>Postal Code:</strong> {address.postalCode}</p>
            <p><strong>Email:</strong> {address.email}</p>
            <p><strong>Telephone:</strong> {address.telephone}</p>
          </div>
        ) : (
          <p className="text-gray-500">No address information available.</p>
        )}
      </section>

      {/* Google Map */}
      {address?.latitude && address?.longitude && (
        <section className="mb-8 bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-4 text-sky-700">Location Map</h3>
          <div className="w-full h-64 rounded overflow-hidden shadow">
            <iframe
              title="Employer Location"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${address.latitude},${address.longitude}&hl=es;z=14&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View on Google Maps
          </a>
        </section>
      )}
    </div>
  );
};

export default OngoingJobDetails;
