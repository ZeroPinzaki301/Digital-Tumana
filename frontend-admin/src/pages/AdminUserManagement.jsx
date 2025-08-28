import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaUser, FaStore, FaBuilding, FaBriefcase, FaUserTie, FaIdBadge, FaImage } from "react-icons/fa";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axiosInstance.get("/api/admin/user-management/verified-users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVerifiedUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="flex flex-col items-center">
          <div className="animate-pulse rounded-full h-16 w-16 bg-sky-400 mb-4"></div>
          <div className="text-xl font-semibold text-sky-700">Loading users...</div>
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
          <h1 className="text-4xl font-bold mb-2 text-sky-800 drop-shadow-md">Verified Users Management</h1>
          <p className="text-sky-600">Manage all verified users and their roles</p>
          <div className="mt-4 bg-sky-500 h-1 w-24 mx-auto rounded-full"></div>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-sky-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
              <FaUser className="h-8 w-8 text-sky-500" />
            </div>
            <p className="text-lg text-gray-600">No verified users found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UserCard = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out border border-sky-100 hover:shadow-xl hover:border-sky-200 ${expanded ? 'ring-2 ring-sky-100' : ''}`}
    >
      <div className="p-6 flex flex-col md:flex-row">
        {/* Left Container - 35% width for user details */}
        <div className="w-full md:w-[35%] pr-0 md:pr-6 mb-6 md:mb-0 border-b md:border-b-0 md:border-r border-sky-100 pb-6 md:pb-0">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-sky-800">User Details</h2>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="md:hidden p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center mb-4">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-sky-200 shadow-inner"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mr-4 border-2 border-sky-200 shadow-inner">
                  <FaUser className="text-sky-600 text-2xl" />
                </div>
              )}
              {/* Fallback for broken images */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 hidden items-center justify-center mr-4 border-2 border-sky-200 shadow-inner">
                <FaUser className="text-sky-600 text-2xl" />
              </div>
              <div>
                <p className="font-medium text-sky-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-sky-600 flex items-center">
                  <FaIdBadge className="mr-1" /> ID: {user._id.slice(-6)}
                </p>
              </div>
            </div>
            
            <DetailItem label="Email" value={user.email} />
            <DetailItem label="Phone" value={user.phoneNumber || "Not provided"} />
            <DetailItem label="Policy Agreement" value={user.agreedToPolicy ? "Yes" : "No"} />
            <DetailItem label="Joined Date" value={new Date(user.createdAt).toLocaleDateString()} />
            <DetailItem label="Last Updated" value={new Date(user.updatedAt).toLocaleDateString()} />
          </div>
        </div>
        
        {/* Right Container - 65% width for role cards */}
        <div className={`w-full md:w-[65%] pl-0 md:pl-6 transition-all duration-500 ${expanded ? 'block' : 'hidden md:block'}`}>
          <h2 className="text-xl font-semibold mb-4 text-sky-800">User Roles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seller Card */}
            <RoleCard 
              title="Seller" 
              icon={<FaStore className="text-sky-500" />}
              data={user.roles?.seller} 
              noDataMessage="No seller data found for this user"
            >
              {user.roles?.seller && (
                <>
                  <DetailItem label="Store Name" value={user.roles.seller.storeName} />
                  <div className="mt-2">
                    <p className="text-sm font-medium text-sky-700 mb-1">Store Picture:</p>
                    {user.roles.seller.storePicture ? (
                      <img 
                        src={user.roles.seller.storePicture} 
                        alt={user.roles.seller.storeName}
                        className="w-20 h-20 object-cover rounded border border-sky-200 shadow-inner"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-sky-100 rounded border border-sky-200 flex items-center justify-center">
                        <FaStore className="text-sky-400 text-xl" />
                      </div>
                    )}
                    {/* Fallback for broken images */}
                    <div className="w-20 h-20 bg-sky-100 hidden rounded border border-sky-200 items-center justify-center">
                      <FaStore className="text-sky-400 text-xl" />
                    </div>
                  </div>
                </>
              )}
            </RoleCard>
            
            {/* Worker Card */}
            <RoleCard 
              title="Worker" 
              icon={<FaBriefcase className="text-sky-500" />}
              data={user.roles?.worker} 
              noDataMessage="No worker data found for this user"
            >
              {user.roles?.worker && (
                <>
                  <DetailItem label="First Name" value={user.roles.worker.firstName} />
                  <DetailItem label="Last Name" value={user.roles.worker.lastName} />
                  <div className="mt-2">
                    <p className="text-sm font-medium text-sky-700 mb-1">Profile Picture:</p>
                    {user.roles.worker.profilePicture ? (
                      <img 
                        src={user.roles.worker.profilePicture} 
                        alt={`${user.roles.worker.firstName} ${user.roles.worker.lastName}`}
                        className="w-20 h-20 object-cover rounded border border-sky-200 shadow-inner"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-sky-100 rounded border border-sky-200 flex items-center justify-center">
                        <FaUser className="text-sky-400 text-xl" />
                      </div>
                    )}
                    {/* Fallback for broken images */}
                    <div className="w-20 h-20 bg-sky-100 hidden rounded border border-sky-200 items-center justify-center">
                      <FaUser className="text-sky-400 text-xl" />
                    </div>
                  </div>
                </>
              )}
            </RoleCard>
            
            {/* Employer Card */}
            <RoleCard 
              title="Employer" 
              icon={<FaBuilding className="text-sky-500" />}
              data={user.roles?.employer} 
              noDataMessage="No employer data found for this user"
            >
              {user.roles?.employer && (
                <>
                  <DetailItem label="Company Name" value={user.roles.employer.companyName} />
                  <div className="mt-2">
                    <p className="text-sm font-medium text-sky-700 mb-1">Profile Picture:</p>
                    {user.roles.employer.profilePicture ? (
                      <img 
                        src={user.roles.employer.profilePicture} 
                        alt={user.roles.employer.companyName}
                        className="w-20 h-20 object-cover rounded border border-sky-200 shadow-inner"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-sky-100 rounded border border-sky-200 flex items-center justify-center">
                        <FaBuilding className="text-sky-400 text-xl" />
                      </div>
                    )}
                    {/* Fallback for broken images */}
                    <div className="w-20 h-20 bg-sky-100 hidden rounded border border-sky-200 items-center justify-center">
                      <FaBuilding className="text-sky-400 text-xl" />
                    </div>
                  </div>
                </>
              )}
            </RoleCard>
            
            {/* Customer Card */}
            <RoleCard 
              title="Customer" 
              icon={<FaUserTie className="text-sky-500" />}
              data={user.roles?.customer} 
              noDataMessage="No customer data found for this user"
            >
              {user.roles?.customer && (
                <DetailItem label="Full Name" value={user.roles.customer.fullName} />
              )}
            </RoleCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ title, icon, data, noDataMessage, children }) => {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200 h-full transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-md">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-2">
          {icon}
        </div>
        <h3 className="font-medium text-lg text-sky-800">{title}</h3>
      </div>
      {data ? (
        <div className="space-y-2">
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-2">
            {icon}
          </div>
          <p className="text-sky-500 italic text-sm">{noDataMessage}</p>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="transition-colors duration-300 hover:bg-sky-50 p-2 rounded-lg">
      <p className="text-sm font-medium text-sky-700">{label}:</p>
      <p className="text-sky-900">{value || "N/A"}</p>
    </div>
  );
};

export default AdminUserManagement;