import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
const AddStaffForm = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [staff, setStaff] = useState({
        name: "",
        email: "",
        phone: "",
        role: "barber",

        permissions: [],
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff((prev) => ({ ...prev, [name]: value }));
    };

    // Handle checkbox changes (permissions for front desk)
    const handlePermissionsChange = (e) => {
        const { value, checked } = e.target;
        setStaff((prev) => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, value]
                : prev.permissions.filter((perm) => perm !== value),
        }));
    };

    // Submit form data to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post("http://localhost:8080/api/staff/add", staff);
            setMessage(response.data.message);
            setStaff({
                name: "",
                email: "",
                phone: "",
                role: "barber",
                workingHours: "",
                permissions: [],
            });
            setTimeout(() => navigate("/viewStaff"), 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to add staff!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Add Staff</h2>

            {message && (
                <div className={`p-3 mb-4 text-white rounded ${message.includes("success") ? "bg-green-500" : "bg-red-500"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={staff.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={staff.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={staff.phone}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-gray-700">Role</label>
                    <select
                        name="role"
                        value={staff.role}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="barber">Barber/Provider</option>
                        <option value="frontdesk">Front Desk</option>
                    </select>
                </div>

                {/* Working Hours - Only for Barber/Provider */}
                {staff.role === "barber" && (
                    <div>
                        <label className="block text-gray-700">Working Hours</label>
                        <input
                            type="text"
                            name="workingHours"
                            value={staff.workingHours}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., 9 AM - 6 PM"
                        />
                    </div>
                )}

                {/* Permissions - Only for Front Desk */}
                {staff.role === "frontdesk" && (
                    <div>
                        <label className="block text-gray-700">Permissions</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    value="manage_appointments"
                                    checked={staff.permissions.includes("manage_appointments")}
                                    onChange={handlePermissionsChange}
                                    className="mr-2"
                                />
                                Manage Appointments
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    value="manage_payments"
                                    checked={staff.permissions.includes("manage_payments")}
                                    onChange={handlePermissionsChange}
                                    className="mr-2"
                                />
                                Manage Payments
                            </label>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}

                >
                    {loading ? "Adding..." : "Add Staff"}
                </button>
            </form>
        </div>
    );
};

export default AddStaffForm;
