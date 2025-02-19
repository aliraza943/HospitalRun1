import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddServiceForm = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [service, setService] = useState({
        name: "",
        duration: "",
        price: "",
        category: "Haircut",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setService((prev) => ({ ...prev, [name]: value }));
    };
    console.log("data")
    // Submit form data to backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
    
        try {
            const response = await axios.post(
                "http://localhost:8080/api/services/add",
                service, // Request body (service data)
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if required
                    },
                }
            );
    
            setMessage(response.data.message);
            setService({ name: "", duration: "", price: "", category: "Haircut" });
    
            setTimeout(() => navigate("/viewServices"), 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to add service!");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Add Service</h2>

            {message && (
                <div className={`p-3 mb-4 text-white rounded ${message.includes("success") ? "bg-green-500" : "bg-red-500"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Name */}
                <div>
                    <label className="block text-gray-700">Service Name</label>
                    <input
                        type="text"
                        name="name"
                        value={service.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-gray-700">Duration (in minutes)</label>
                    <input
                        type="number"
                        name="duration"
                        value={service.duration}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-gray-700">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={service.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-gray-700">Category</label>
                    <select
                        name="category"
                        value={service.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Haircut">Haircut</option>
                        <option value="Shaving">Shaving</option>
                        <option value="Facial">Facial</option>
                        <option value="Massage">Massage</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Service"}
                </button>
            </form>
        </div>
    );
};

export default AddServiceForm;
