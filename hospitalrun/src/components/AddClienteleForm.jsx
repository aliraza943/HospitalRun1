import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AddClienteleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if providerId exists in location.state
  const providerId = location.state?.providerId;

  const initialClientState = {
    name: "test",
    email: "test@gmail.com",
    phone: "1234567",
    address: "abcdf",
    ...(providerId ? { providerId } : {})
  };

  const [client, setClient] = useState(initialClientState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/clientelle/add",
        client, // Send providerId only if it exists
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message);
      setClient({ name: "", email: "", phone: "", address: "" });

      // Navigate based on providerId presence
      setTimeout(() => navigate(providerId ? "/adminViewClientele" : "/providerViewClientele"), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add client!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

      {message && (
        <div
          className={`p-3 mb-4 text-white rounded ${message.includes("success") ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={client.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={client.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={client.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={client.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Client"}
        </button>
      </form>
    </div>
  );
};

export default AddClienteleForm;
