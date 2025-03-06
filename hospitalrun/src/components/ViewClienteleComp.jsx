import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewServicesComp = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingClient, setEditingClient] = useState(null);
    const [updatedClient, setUpdatedClient] = useState({ name: "", email: "", phone: "", address: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch clients from API
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const token = localStorage.getItem("token"); // Get token from localStorage
                if (!token) throw new Error("No authentication token found");
    
                const response = await fetch("http://localhost:8080/api/clientelle/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Attach token here
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
    
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this client?")) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/clientelle/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete client.");

            setClients(clients.filter(client => client._id !== id));
        } catch (err) {
            toast.error("Error deleting client: " + err.message);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client._id);
        setUpdatedClient(client);
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:8080/api/clientelle/${editingClient}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedClient),
            });

            if (!response.ok) throw new Error("Failed to update client.");

            setClients(clients.map(client => (client._id === editingClient ? updatedClient : client)));
            setEditingClient(null);
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Error updating client: " + err.message);
        }
    };

    if (loading) return <p className="text-center mt-4">Loading clients...</p>;
    if (error) return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Clientele List</h2>
                <button 
                    onClick={() => navigate('/addClienteleForm')} 
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    Add Clientele
                </button>
            </div>

            <input
                type="text"
                placeholder="Search clients"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full mb-4 p-2 border rounded"
            />

            <table className="w-full border-collapse text-center border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">Address</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients
                        .filter(client => client.username.toLowerCase().includes(searchQuery))
                        .map((client) => (
                            <tr key={client._id} className="border">
                                <td className="border p-2">{client.username}</td>
                                <td className="border p-2">{client.email}</td>
                                <td className="border p-2">{client.phone}</td>
                                <td className="border p-2">{client.address}</td>
                                <td className="border p-2 space-x-2">
                                    <button onClick={() => handleEdit(client)} className="text-blue-500 text-lg">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(client._id)} className="text-red-500 text-lg">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">Edit Client</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                type="text"
                                value={updatedClient.username}
                                onChange={(e) => setUpdatedClient({ ...updatedClient, username: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="email"
                                value={updatedClient.email}
                                onChange={(e) => setUpdatedClient({ ...updatedClient, email: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="tel"
                                value={updatedClient.phone}
                                onChange={(e) => setUpdatedClient({ ...updatedClient, phone: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                value={updatedClient.address}
                                onChange={(e) => setUpdatedClient({ ...updatedClient, address: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                    Update Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewServicesComp;
