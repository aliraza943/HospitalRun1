import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ViewStaffComp = () => {
    const [staffList, setStaffList] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const [updatedStaff, setUpdatedStaff] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        workingHours: "",
        permissions: [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // ✅ For navigation

    useEffect(() => {
        fetch("http://localhost:8080/api/staff")
            .then((res) => res.json())
            .then((data) => setStaffList(data))
            .catch((err) => console.error("Error fetching staff:", err));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;

        try {
            await fetch(`http://localhost:8080/api/staff/${id}`, { method: "DELETE" });
            setStaffList(staffList.filter((staff) => staff._id !== id));
            alert("Staff deleted successfully!");
        } catch (error) {
            console.error("Error deleting staff:", error);
            alert("Failed to delete staff.");
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff._id);
        setUpdatedStaff({ ...staff });
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/staff/${editingStaff}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedStaff),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updatedList = staffList.map((s) => (s._id === editingStaff ? updatedStaff : s));
            setStaffList(updatedList);
            setEditingStaff(null);
            setIsModalOpen(false);
            alert("Staff updated successfully!");
        } catch (error) {
            console.error("Error updating staff:", error);
            alert("Failed to update staff.");
        }
    };

    const handleSchedule = (staff) => {
        navigate("/view-schedules", { state: { staff } }); // ✅ Pass staff data to Schedule page
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Staff List</h2>
                <button
                    onClick={() => navigate("/addStaff")}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Staff
                </button>
            </div>

            <table className="w-full border-collapse text-center border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staffList.map((staff) => (
                        <tr key={staff._id} className="border">
                            <td className="border p-2">{staff.name}</td>
                            <td className="border p-2">{staff.email}</td>
                            <td className="border p-2">{staff.phone}</td>
                            <td className="border p-2">{staff.role}</td>
                            <td className="border p-2 space-x-2">
                                <button
                                    onClick={() => handleEdit(staff)}
                                    className="text-blue-500 text-lg"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(staff._id)}
                                    className="text-red-500 text-lg"
                                >
                                    <FaTrash />
                                </button>
                                <button
                                    onClick={() => handleSchedule(staff)}
                                    className="text-green-500 text-lg"
                                >
                                    <FaCalendarAlt />
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
                        <h3 className="text-xl font-semibold mb-4">Edit Staff</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={updatedStaff.name}
                                onChange={(e) => setUpdatedStaff({ ...updatedStaff, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={updatedStaff.email}
                                onChange={(e) => setUpdatedStaff({ ...updatedStaff, email: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                name="phone"
                                value={updatedStaff.phone}
                                onChange={(e) => setUpdatedStaff({ ...updatedStaff, phone: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <select
                                name="role"
                                value={updatedStaff.role}
                                onChange={(e) => setUpdatedStaff({ ...updatedStaff, role: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="barber">Barber/Provider</option>
                                <option value="frontdesk">Front Desk</option>
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                    Update Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewStaffComp;
