import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AddStaffForm = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "provider",
    workingHours: "", // This can be removed or left for non-providers
    permissions: [],
    services: [], // For providers, we'll push selected service IDs here
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetchedServices, setFetchedServices] = useState([]); // Services fetched from API

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for permissions (for front desk)
  const handlePermissionsChange = (e) => {
    const { value, checked } = e.target;
    setStaff((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, value]
        : prev.permissions.filter((perm) => perm !== value),
    }));
  };

  // Handle service checkbox changes for providers
  const handleServiceCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setStaff((prev) => ({
      ...prev,
      services: checked
        ? [...prev.services, value]
        : prev.services.filter((serviceId) => serviceId !== value),
    }));
  };

  // Submit form data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/staff/add",
        staff, // Pass staff as request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if required
          },
        }
      );
      setMessage(response.data.message);
      setStaff({
        name: "",
        email: "",
        phone: "",
        role: "provider",
        workingHours: "",
        permissions: [],
        services: [],
      });
      setTimeout(() => navigate("/viewStaff"), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add staff!");
    } finally {
      setLoading(false);
    }
  };

  // For providers, fetch services from API
  useEffect(() => {
    if (staff.role === "provider") {
      const fetchServices = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/api/services/serviceTypes/serviceDetails",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch services");
          const data = await response.json();
          setFetchedServices(data);
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      };
      fetchServices();
    }
  }, [staff.role]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Add Staff</h2>

      {message && (
        <div
          className={`p-3 mb-4 text-white rounded ${
            message.includes("success") ? "bg-green-500" : "bg-red-500"
          }`}
        >
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
            <option value="provider">provider/Provider</option>
            <option value="frontdesk">Front Desk</option>
          </select>
        </div>

        {/* For provider Role: Show service checkboxes */}
        {staff.role === "provider" && (
          <div>
            <label className="block text-gray-700">Select Services</label>
            <div className="flex flex-col gap-2">
              {fetchedServices.map((service) => (
                <label key={service._id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={service._id}
                    checked={staff.services.includes(service._id)}
                    onChange={handleServiceCheckboxChange}
                    className="mr-2"
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Working Hours - Only for non-providers (optional) */}
      

        {/* Permissions - Only for Front Desk */}
        {staff.role === "frontdesk" && (
          <div>
            <label className="block text-gray-700">Permissions</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="manage_services"
                  checked={staff.permissions.includes("manage_services")}
                  onChange={handlePermissionsChange}
                  className="mr-2"
                />
                Manage Services
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="manage_staff"
                  checked={staff.permissions.includes("manage_staff")}
                  onChange={handlePermissionsChange}
                  className="mr-2"
                />
                Manage Staff
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="manage_businessHours"
                  checked={staff.permissions.includes("manage_businessHours")}
                  onChange={handlePermissionsChange}
                  className="mr-2"
                />
                Manage Business Hours
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="modify_working_hours"
                  checked={staff.permissions.includes("modify_working_hours")}
                  onChange={handlePermissionsChange}
                  className="mr-2"
                />
                Modify Working Hours
              </label>
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
                  value="manage_clientele"
                  checked={staff.permissions.includes("manage_clientele")}
                  onChange={handlePermissionsChange}
                  className="mr-2"
                />
                Manage Clientele
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
