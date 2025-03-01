import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewStaffCompAdmin from "./StaffAppointmentAdmin"; // Import the component

const ViewStaffComp = () => {
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/api/staff", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    alert("Your token expired. Kindly log back in.");
                    localStorage.removeItem("token"); // Clear expired token
                    navigate("/login"); // Redirect to login page
                    return null;
                }
                
                if (res.status === 403) {
                    navigate("/unauthorized", {
                        state: { message: "You are not authorized to manage appointments" },
                    });
                    return null;
                }

                return res.json();
            })
            .then((data) => {
                if (data) {
                    const filteredStaff = data.filter((staff) => staff.role !== "frontdesk");
                    setStaffList(filteredStaff);
                    if (filteredStaff.length > 0) {
                        setSelectedStaff(filteredStaff[0]); // Default to first staff
                    }
                }
            })
            .catch((err) => console.error("Error fetching staff:", err));
    }, [navigate]);

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg min-h-screen max-h-screen overflow-y-auto flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Select Staff Member</h2>

            {/* Staff Dropdown */}
            <select
                className="w-full p-2 border rounded-md mb-4"
                value={selectedStaff?._id || ""}
                onChange={(e) => {
                    const staff = staffList.find((s) => s._id === e.target.value);
                    setSelectedStaff(staff || null);
                }}
            >
                {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                        {staff.name} - {staff.role}
                    </option>
                ))}
            </select>

            {/* Content Section */}
            {selectedStaff && (
                <div className="mt-6 flex-grow">
                    <ViewStaffCompAdmin staff={selectedStaff} />
                </div>
            )}
        </div>
    );
};

export default ViewStaffComp;
