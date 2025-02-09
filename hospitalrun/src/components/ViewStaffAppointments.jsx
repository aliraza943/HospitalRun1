import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ViewStaffComp = () => {
    const [staffList, setStaffList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/api/staff")
            .then((res) => res.json())
            .then((data) => setStaffList(data))
            .catch((err) => console.error("Error fetching staff:", err));
    }, []);

    const handleManageAppointments = (staff) => {
        navigate("/viewStaffAppointments", { state: { staff } });
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Staff List</h2>

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
                            <td className="border p-2">
                                <button
                                    onClick={() => handleManageAppointments(staff)}
                                    className="text-green-500 text-lg flex items-center gap-2"
                                >
                                    <FaCalendarAlt /> Manage Appointments
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewStaffComp;
