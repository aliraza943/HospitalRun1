import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the permission options for frontdesk users, including manage_products.
const permissionOptions = [
  "manage_services",
  "manage_staff",
  "manage_businessHours",
  "modify_working_hours",
  "manage_appointments",
  "manage_clientele",
  "manage_products",
  "manage_site" // New permission added
];

const ViewStaffComp = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [updatedStaff, setUpdatedStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    workingHours: "",
    // For frontdesk users, permissions will be stored as an object.
    permissions: {},
    // For providers, services is an array of selected service IDs.
    services: [],
  });
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch staff list from API
  useEffect(() => {
    fetch("http://localhost:8080/api/staff", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/unauthorized", {
            state: { message: "Your token expired. Please log back in." },
          });
          return null;
        }
        if (res.status === 403) {
          navigate("/unauthorized", {
            state: { message: "You are not authorized to manage staff." },
          });
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStaffList(data);
          setFilteredStaff(data);
        }
      })
      .catch((err) => console.error("Error fetching staff:", err));
  }, [navigate]);

  // Fetch services list from API (for provider role)
  useEffect(() => {
    fetch("http://localhost:8080/api/services/serviceTypes/serviceDetails", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => setServices(data))
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  // Filter staff list based on search query
  useEffect(() => {
    setFilteredStaff(
      staffList.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, staffList]);

  // Delete staff member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;

    try {
      await fetch(`http://localhost:8080/api/staff/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStaffList(staffList.filter((staff) => staff._id !== id));
      toast.success("Staff deleted successfully!");
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff.");
    }
  };

  // Open modal for editing staff.
  // For frontdesk users, convert permissions array to an object.
  // For providers, ensure services are set as an array.
  const handleEdit = (staff) => {
    setEditingStaff(staff._id);
    const updatedStaffData = { ...staff };

    if (staff.role === "frontdesk") {
      let permissionsObj = {};
      permissionOptions.forEach((perm) => {
        permissionsObj[perm] = staff.permissions.includes(perm);
      });
      updatedStaffData.permissions = permissionsObj;
    }
    
    if (staff.role === "provider") {
      // Ensure services are stored as an array.
      updatedStaffData.services = Array.isArray(staff.services)
        ? staff.services
        : staff.service
        ? [staff.service]
        : [];
    }

    setUpdatedStaff(updatedStaffData);
    setIsModalOpen(true);
  };

  // Handle radio button changes for a specific permission (for frontdesk).
  const handlePermissionChange = (perm, value) => {
    setUpdatedStaff((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: value,
      },
    }));
  };

  // Update staff member details and send updated data to the server
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // For frontdesk, convert permissions object to an array.
      let payload = { ...updatedStaff };
      if (updatedStaff.role === "frontdesk") {
        payload.permissions = Object.entries(updatedStaff.permissions)
          .filter(([key, value]) => value)
          .map(([key]) => key);
      }
      const res = await fetch(`http://localhost:8080/api/staff/${editingStaff}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      setStaffList(staffList.map((s) => (s._id === editingStaff ? payload : s)));
      setEditingStaff(null);
      setIsModalOpen(false);
      toast.success("Staff updated successfully!");
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error("Failed to update staff.");
    }
  };

  // Navigate to schedule view
  const handleSchedule = (staff) => {
    navigate("/view-schedules", { state: { staff } });
  };

  // Handle toggling a service checkbox
  const handleServiceToggle = (serviceId) => {
    const currentServices = updatedStaff.services || [];
    if (currentServices.includes(serviceId)) {
      // Remove if already selected.
      setUpdatedStaff({
        ...updatedStaff,
        services: currentServices.filter((id) => id !== serviceId),
      });
    } else {
      // Add to selected services.
      setUpdatedStaff({
        ...updatedStaff,
        services: [...currentServices, serviceId],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Staff List</h2>
        <button
          onClick={() => navigate("/addStaff")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Staff
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, or role..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

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
          {filteredStaff.map((staff) => (
            <tr key={staff._id} className="border">
              <td className="border p-2">{staff.name}</td>
              <td className="border p-2">{staff.email}</td>
              <td className="border p-2">{staff.phone}</td>
              <td className="border p-2">{staff.role}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(staff)} className="text-blue-500 text-lg">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(staff._id)} className="text-red-500 text-lg">
                  <FaTrash />
                </button>
                <button onClick={() => handleSchedule(staff)} className="text-green-500 text-lg">
                  <FaCalendarAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for editing staff */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Staff</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="name"
                value={updatedStaff.name}
                onChange={(e) =>
                  setUpdatedStaff({ ...updatedStaff, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={updatedStaff.email}
                onChange={(e) =>
                  setUpdatedStaff({ ...updatedStaff, email: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="phone"
                value={updatedStaff.phone}
                onChange={(e) =>
                  setUpdatedStaff({ ...updatedStaff, phone: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="role"
                value={updatedStaff.role}
                onChange={(e) =>
                  setUpdatedStaff({ ...updatedStaff, role: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="provider">provider/Provider</option>
                <option value="frontdesk">Front Desk</option>
              </select>

              {/* Checkboxes for Service Selection for provider Role */}
              {updatedStaff.role === "provider" && (
                <div className="mt-4">
                  <label className="block mb-1 font-medium">Services</label>
                  {services.map((service) => (
                    <div key={service._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="services"
                        value={service._id}
                        checked={updatedStaff.services.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                      />
                      <span>{service.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Permissions for Frontdesk Role */}
              {updatedStaff.role === "frontdesk" && (
                <div className="mt-4">
                  <label className="block mb-1 font-medium">Permissions</label>
                  {permissionOptions.map((perm) => (
                    <div key={perm} className="flex items-center space-x-4">
                      <span className="capitalize">{perm.replace(/_/g, " ")}</span>
                      <label>
                        <input
                          type="radio"
                          name={perm}
                          value="true"
                          checked={updatedStaff.permissions[perm] === true}
                          onChange={() => handlePermissionChange(perm, true)}
                        />
                        Allow
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={perm}
                          value="false"
                          checked={updatedStaff.permissions[perm] === false}
                          onChange={() => handlePermissionChange(perm, false)}
                        />
                        Disallow
                      </label>
                    </div>
                  ))}
                </div>
              )}

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
