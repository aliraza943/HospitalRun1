import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import EditClientModal from "./EditClientModal"; // adjust the path as needed

const StaffClienteleView = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing
  const [editingClient, setEditingClient] = useState(null);
  const [updatedClient, setUpdatedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch staff data
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

  // Fetch clientele data
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

  // Filter staff by provider role
  const providerStaff = staffList.filter((staff) => staff.role === "provider");

  // Opens the edit modal with the selected client's data
  const handleEdit = (client) => {
    setEditingClient(client);
    setUpdatedClient(client);
    setIsModalOpen(true);
  };

  // Sends update to API and updates local state
  const handleUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/clientelle/${editingClient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update client.");

      setClients(clients.map(client => 
        client._id === editingClient._id ? updatedData : client
      ));
      setEditingClient(null);
      setIsModalOpen(false);
      toast.success("Client updated successfully!");
    } catch (err) {
      toast.error("Error updating client: " + err.message);
    }
  };

  // Delete function to remove a client
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/clientelle/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete client.");

      setClients(clients.filter(client => client._id !== id));
      toast.success("Client deleted successfully!");
    } catch (err) {
      toast.error("Error deleting client: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Providers List and Their Clientele</h2>
      {providerStaff.map((staff) => {
        // Filter clients for this provider
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
                  <div
                    key={client._id}
                    className="border rounded p-4 shadow hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/clientDetails", { state: { client } })}
                  >
                    <h4 className="font-bold text-lg mb-2">{client.username}</h4>
                    <p className="text-sm text-gray-700">{client.email}</p>
                    <p className="text-sm text-gray-700">{client.phone}</p>
                    <p className="text-sm text-gray-700">{client.address}</p>
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(client);
                        }}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client._id);
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No clientele for this provider.</p>
            )}
          </div>
        );
      })}
      {isModalOpen && updatedClient && (
        <EditClientModal 
          updatedClient={updatedClient}
          setUpdatedClient={setUpdatedClient}
          handleUpdate={handleUpdate}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StaffClienteleView;
