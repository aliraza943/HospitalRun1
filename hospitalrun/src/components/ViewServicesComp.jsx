import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewServicesComp = () => {
    const navigate = useNavigate();
    const [servicesList, setServicesList] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingService, setEditingService] = useState(null);
    const [updatedService, setUpdatedService] = useState({
        name: "",
        price: "",
        duration: "",
        description: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = servicesList.filter(
            (service) =>
                service.name.toLowerCase().includes(query) ||
                service.price.toString().includes(query) ||
                service.duration.toString().includes(query)
        );
        setFilteredServices(filtered);
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/services", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if required
                    },
                });

                if (res.status === 401) {
                    navigate("/unauthorized", {
                        state: { message: "Your token expired Kindly log back in" },
                    });
                    return;
                }

                if (res.status === 403) {
                    navigate("/unauthorized", {
                        state: { message: "You are not authorized to manage services" },
                    });
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch services.");

                const data = await res.json();
                setServicesList(data);
                setFilteredServices(data);
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        };

        fetchServices();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
    
        try {
            const res = await fetch(`http://localhost:8080/api/services/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            if (res.status === 401) {
                toast.error("Unauthorized: You must log in to delete services.");
                return;
            }
    
            if (res.status === 403) {
                toast.error("Forbidden: You do not have permission to delete this service.");
                return;
            }
    
            if (!res.ok) throw new Error("Failed to delete service.");
    
            const updatedList = servicesList.filter((service) => service._id !== id);
            setServicesList(updatedList);
            setFilteredServices(updatedList);
            toast.success("Service deleted successfully!");
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service.");
        }
    };

    const handleEdit = (service) => {
        setEditingService(service._id);
        setUpdatedService({ ...service });
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/services/${editingService}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${localStorage.getItem("token")}`  
                },
                body: JSON.stringify(updatedService),
            });
    
            if (res.status === 401) {
                toast.error("Unauthorized: You must log in to update services.");
                return;
            }
    
            if (res.status === 403) {
                toast.error("Forbidden: You do not have permission to update this service.");
                return;
            }
    
            if (!res.ok) throw new Error("Failed to update");
    
            const updatedList = servicesList.map((s) =>
                s._id === editingService ? updatedService : s
            );
            setServicesList(updatedList);
            setFilteredServices(updatedList);
            setEditingService(null);
            setIsModalOpen(false);
            toast.success("Service updated successfully!");
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error("Failed to update service.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Services List</h2>
                <button
                    onClick={() => navigate("/addServices")}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Services
                </button>
            </div>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search services by name, price, duration"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full mb-4 p-2 border rounded"
            />

            <table className="w-full border-collapse text-center border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Duration</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredServices.map((service) => (
                        <tr key={service._id} className="border">
                            <td className="border p-2">{service.name}</td>
                            <td className="border p-2">${service.price}</td>
                            <td className="border p-2">{service.duration} min</td>
                            <td className="border p-2">{service.description}</td>
                            <td className="border p-2 space-x-2">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="text-blue-500 text-lg"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(service._id)}
                                    className="text-red-500 text-lg"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">Edit Service</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={updatedService.name}
                                onChange={(e) =>
                                    setUpdatedService({ ...updatedService, name: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                name="price"
                                value={updatedService.price}
                                onChange={(e) =>
                                    setUpdatedService({ ...updatedService, price: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                name="duration"
                                value={updatedService.duration}
                                onChange={(e) =>
                                    setUpdatedService({ ...updatedService, duration: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <textarea
                                name="description"
                                value={updatedService.description}
                                onChange={(e) =>
                                    setUpdatedService({ ...updatedService, description: e.target.value })
                                }
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
                                    Update Service
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
