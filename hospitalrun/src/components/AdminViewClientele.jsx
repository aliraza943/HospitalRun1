import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const StaffClienteleView = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch staff list from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const response = await fetch("http://localhost:8080/api/staff", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch staff.");
        const data = await response.json();
        setStaffList(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStaff();
  }, []);

  // Fetch clientele from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const response = await fetch("http://localhost:8080/api/clientelle/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch clientele.");
        const data = await response.json();
        setClients(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

  // Filter to only show staff with role "barber"
  const barberStaff = staffList.filter((staff) => staff.role === "barber");

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Barbers and Their Clientele</h2>
      {barberStaff.map((staff) => {
        // Filter clients whose providerId matches this barber's _id
        const staffClients = clients.filter(client => client.providerId === staff._id);
        return (
          <div key={staff._id} className="mb-10 border border-gray-200 rounded-lg shadow-lg p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-semibold">{staff.name}</h3>
                <p className="text-gray-600">{staff.email}</p>
              </div>
              <button
                onClick={() =>
                  navigate("/addClienteleForm", { state: { providerId: staff._id } })
                }
                className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white px-4 py-2 rounded"
              >
                Add Clientele
              </button>
            </div>
            {staffClients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {staffClients.map((client) => (
                  <div key={client._id} className="border rounded p-4 shadow hover:shadow-lg transition-shadow">
                    <h4 className="font-bold text-lg mb-2">{client.username}</h4>
                    <p className="text-sm text-gray-700">{client.email}</p>
                    <p className="text-sm text-gray-700">{client.phone}</p>
                    <p className="text-sm text-gray-700">{client.address}</p>
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={() => console.log("Edit", client._id)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => console.log("Delete", client._id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No clientele for this barber.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StaffClienteleView;
