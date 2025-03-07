import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewStaffCompAdmin from "./StaffAppointmentAdmin"; // Import the component

const ViewStaffComp = () => {
    const [staffList, setStaffList] = useState([]);
    const [filteredStaffList, setFilteredStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/staff", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    toast.error("Your token expired. Kindly log back in.");
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
                    setFilteredStaffList(filteredStaff);
                    if (filteredStaff.length > 0) {
                        setSelectedStaff(filteredStaff[0]); // Default to first staff
                        setSearchTerm(filteredStaff[0].name); // Set default input value
                    }
                }
            })
            .catch((err) => console.error("Error fetching staff:", err));
    }, [navigate]);

    // Filter staff based on search term
    useEffect(() => {
        const filtered = staffList.filter((staff) =>
            staff.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStaffList(filtered);
    }, [searchTerm, staffList]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white  rounded-lg min-h-screen max-h-screen overflow-y-auto flex flex-col">
            <ToastContainer />
            <h2 className="text-2xl font-semibold mb-4">Providers List</h2>

            {/* Search Bar with Attached Dropdown */}
            <div className="relative w-full" ref={dropdownRef}>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-t-md focus:outline-none"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setDropdownOpen(true)} // Show dropdown when input is focused
                />

                {dropdownOpen && (
                    <div className="absolute w-full bg-white border border-gray-300 rounded-b-md  max-h-60 overflow-y-auto z-10">
                        {filteredStaffList.length > 0 ? (
                            filteredStaffList.map((staff) => (
                                <div
                                    key={staff._id}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => {
                                        setSelectedStaff(staff);
                                        setSearchTerm(staff.name); // Set selected name in input
                                        setDropdownOpen(false); // Close dropdown
                                    }}
                                >
                                    {staff.name} - {staff.role}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">No staff found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            {selectedStaff && (
                <div className=" flex-grow">
                    <ViewStaffCompAdmin staff={selectedStaff} />
                </div>
            )}
        </div>
    );
};

export default ViewStaffComp;
