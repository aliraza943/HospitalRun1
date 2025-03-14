import React, { useEffect, useState, useRef } from "react";
import ReceiptModal from "./RecieptModal"; // Import receipt modal
import EditAppointmentModal from "./EventEditDetails";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const CheckOutView = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState("All");
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  // selectedStaff is null when "All Staff" is selected.
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("All Staff");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(getLocalDate());
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Helper to get local date (YYYY-MM-DD)
  function getLocalDate() {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    );
  }

  // Fetch staff list
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
          localStorage.removeItem("token");
          navigate("/login");
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
          // Default to "All Staff"
          setSelectedStaff(null);
          setSearchTerm("All Staff");
        }
      })
      .catch((err) => console.error("Error fetching staff:", err));
  }, [navigate]);

  // Staff search filtering (does not include the "All Staff" option)
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

  // Fetch appointments with filters for date and staffId
  const fetchAppointments = async (currentPage, currentLimit) => {
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/checkout/data?page=${currentPage}&limit=${currentLimit}&date=${dateFilter}`;
      // Only add staffId filter if a specific staff is selected
      if (selectedStaff && selectedStaff._id) {
        url += `&staffId=${selectedStaff._id}`;
      }
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const now = new Date();
      const updatedAppointments = data.data.map((appointment) => {
        const startTime = new Date(appointment.start);
        const endTime = new Date(appointment.end);
        let status = appointment.status.toLowerCase();
        if (status === "booked" && startTime <= now && now < endTime) {
          status = "ongoing";
        }
        return { ...appointment, status };
      });
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);
      setPage(data.page);
      setLimit(data.limit);
      setTotal(updatedAppointments.length);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch appointments when page, limit, dateFilter, or selectedStaff change
  useEffect(() => {
    fetchAppointments(page, limit);
  }, [page, limit, dateFilter, selectedStaff]);

  // Filter appointments by status if needed
  useEffect(() => {
    if (filter === "All") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((app) => app.status === filter.toLowerCase())
      );
    }
  }, [filter, appointments]);

  // Event handlers for updating and deleting appointments
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      const response = await fetch("http://localhost:8080/api/staff/appointments/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          staffId: selectedEvent.staffId._id,
          start: selectedEvent.start,
          end: selectedEvent.end,
        }),
      });
      if (response.ok) {
        setAppointments(appointments.filter((appt) => appt._id !== selectedEvent._id));
        setShowEventDetailsModal(false);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    try {
      const startUTC = new Date(selectedEvent.start).toISOString();
      const endUTC = new Date(selectedEvent.end).toISOString();
      const response = await fetch(
        `http://localhost:8080/api/staff/appointments/${selectedEvent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: selectedEvent.clientName,
            clientName: selectedEvent.clientName,
            serviceType: selectedEvent.serviceType,
            serviceCharges: selectedEvent.serviceCharges,
            date: new Date(selectedEvent.start).toISOString().split("T")[0],
            start: startUTC,
            end: endUTC,
            staffId: selectedEvent.staffId._id,
            clientId: selectedEvent.clientId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Appointment updated successfully!");
        fetchAppointments(page, limit);
        setShowEventDetailsModal(false);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update the appointment.");
    }
  };

  // Handler for selecting an appointment event
  const handleEventSelect = (event) => {
    if (event.title === "Non Working Hours") return;
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="relative w-full" ref={dropdownRef}>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-t-md focus:outline-none"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
        />
        {dropdownOpen && (
          <div className="absolute w-full bg-white border border-gray-300 rounded-b-md max-h-60 overflow-y-auto z-10">
            {/* Always show the "All Staff" option at the top */}
            <div
              key="all-staff-option"
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setSelectedStaff(null);
                setSearchTerm("All Staff");
                setDropdownOpen(false);
              }}
            >
              All Staff
            </div>
            {filteredStaffList.length > 0 ? (
              filteredStaffList.map((staff) => (
                <div
                  key={staff._id}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedStaff(staff);
                    setSearchTerm(staff.name);
                    setDropdownOpen(false);
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

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="mr-2">Filter by status:</label>
          <select
            className="border px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="booked">Booked</option>
            <option value="ongoing">Ongoing</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Filter by date:</label>
          <input
            type="date"
            className="border px-2 py-1"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div>
          <label className="mr-2">Filter by month:</label>
          <select
            className="border px-2 py-1"
            onChange={(e) => {
              const selectedOption = e.target.value;
              if (selectedOption === "thisMonth") {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const formattedMonth = `${year}-${String(month).padStart(2, "0")}`;
                setDateFilter(formattedMonth);
              } else if (selectedOption === "lastMonth") {
                const now = new Date();
                now.setMonth(now.getMonth() - 1);
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const formattedMonth = `${year}-${String(month).padStart(2, "0")}`;
                setDateFilter(formattedMonth);
              }
            }}
          >
            <option value="">Select Month</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading appointments...</p>}
      {!loading && filteredAppointments.length === 0 && <p>No appointments found.</p>}
      {!loading && filteredAppointments.length > 0 && (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Client Name</th>
              <th className="px-4 py-2 border">Service Name</th>
              <th className="px-4 py-2 border">Start Time</th>
              <th className="px-4 py-2 border">End Time</th>
              <th className="px-4 py-2 border">Total Bill</th>
              <th className="px-4 py-2 border">Staff Name</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id} className="border-t">
                <td className="px-4 py-2 border">{appointment.clientName}</td>
                <td className="px-4 py-2 border">{appointment.serviceName}</td>
                <td className="px-4 py-2 border">
                  {new Date(appointment.start).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(appointment.end).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  ${appointment.totalBill.toFixed(2)}
                </td>
                <td className="px-4 py-2 border">
                  {appointment.staffId?.name || "N/A"}
                </td>
                <td className="px-4 py-2 border capitalize">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      appointment.status === "ongoing"
                        ? "bg-green-500 text-white"
                        : appointment.status === "completed"
                        ? "bg-blue-500 text-white"
                        : appointment.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-white"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-4 py-2 border flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    Show Receipt
                  </button>
                  {appointment.status !== "completed" && (
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded"
                      onClick={() => handleEventSelect(appointment)}
                    >
                      Edit Appointment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ReceiptModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
      {showEventDetailsModal && selectedEvent && (
        <EditAppointmentModal
          showEventDetailsModal={showEventDetailsModal}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setShowEventDetailsModal={setShowEventDetailsModal}
          handleUpdateEvent={handleUpdateEvent}
          handleDeleteEvent={handleDeleteEvent}
          workingHours={selectedEvent.staffId.workingHours}
          staffservices={selectedEvent.staffId.services}
          staff={selectedEvent.staffId}
        />
      )}
    </div>
  );
};

export default CheckOutView;
