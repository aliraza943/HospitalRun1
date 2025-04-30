import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  
  const [imagePreview, setImagePreview] = useState(null);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStaffList = () => {
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
  };
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
        (staff) => {
          const query = searchQuery.toLowerCase();
          return (
            (staff.name && staff.name.toLowerCase().includes(query)) ||
            (staff.email && staff.email.toLowerCase().includes(query)) ||
            (staff.role && staff.role.toLowerCase().includes(query))
          );
        }
      )
    );
  }, [searchQuery, staffList]);

  const handleImageUpload = (file) => {
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set preview from FileReader result
    };
    reader.readAsDataURL(file); // This triggers the onloadend event when complete
    
    setUpdatedStaff((prev) => ({
      ...prev,
      imageFile: file, // Store the File object for uploading
    }));
  };
  

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

    // Reset image preview when opening edit modal
    setImagePreview(null);

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
      const formData = new FormData();
  
      formData.append("name", updatedStaff.name);
      formData.append("email", updatedStaff.email);
      formData.append("phone", updatedStaff.phone);
      formData.append("role", updatedStaff.role);
  
      if (updatedStaff.role === "provider") {
        updatedStaff.services.forEach((serviceId) =>
          formData.append("services", serviceId)
        );
      }
  
      if (updatedStaff.role === "frontdesk") {
        const allowedPerms = Object.entries(updatedStaff.permissions)
          .filter(([_, value]) => value)
          .map(([key]) => key);
        formData.append("permissions", JSON.stringify(allowedPerms));
      }
  
      // Attach image file if uploaded
      if (updatedStaff.imageFile) {
        formData.append("image", updatedStaff.imageFile); // Attach File object
      }
  
      const res = await fetch(`http://localhost:8080/api/staff/${editingStaff}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      if (!res.ok) throw new Error("Failed to update");
  
      const updated = await res.json(); // Get updated record from response
      
      // Update staff list with newly updated staff data
     fetchStaffList();
      
      // Reset states
      setEditingStaff(null);
      setIsModalOpen(false);
      setImagePreview(null);
      
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

  // Close modal and reset states
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setImagePreview(null);
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
            <th className="border p-2">Image</th>
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
              <td className="border p-2">
                {staff.image ? (
                  <img
                    src={`http://localhost:8080${staff.image}`}
                    alt={staff.name}
                    className="w-10 h-10 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mx-auto">
                    {staff.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </td>
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
                <option value="provider">Provider</option>
                <option value="frontdesk">Front Desk</option>
              </select>

              {/* Services for provider role */}
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

              {/* Permissions for frontdesk role */}
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

              {/* Staff Image Upload */}
              <div className="mt-4">
                <label className="block mb-1 font-medium">Profile Image</label>

                {/* Show preview if image is selected or already exists */}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Staff Preview"
                    className="w-24 h-24 object-cover rounded-full mb-2"
                  />
                ) : updatedStaff.image ? (
                  <img
                    src={`http://localhost:8080${updatedStaff.image}`}
                    alt="Staff Preview"
                    className="w-24 h-24 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <span className="text-gray-500 text-xl">No Image</span>
                  </div>
                )}

                {/* File input for uploading new image */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 mt-2"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
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