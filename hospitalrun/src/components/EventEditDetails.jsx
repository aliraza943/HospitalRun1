import React, { useState, useEffect } from "react";

const EventDetailsModal = ({
  showEventDetailsModal,
  selectedEvent,
  setSelectedEvent,
  setShowEventDetailsModal,
  handleUpdateEvent,
  handleDeleteEvent,
  workingHours,
  staffservices,
  staff, // Array of service IDs that belong to the staff member
}) => {
  // State for time range and working day check
  const [timeRange, setTimeRange] = useState([{ min: "09:00", max: "18:00" }]);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  // State for available services fetched from API
  const [services, setServices] = useState([]);
  // State for available clients fetched from API
  const [clients, setClients] = useState([]);

  // Helper: Convert time in "HH:MM AM/PM" to "HH:MM" 24-hour format
  const convertTo24Hour = (time) => {
    const [hours, minutes] = time.split(":");
    const [min, period] = minutes.split(" ");
    let hour24 = parseInt(hours, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${min}`;
  };

  // Helper: Get working hours for a day from workingHours prop
  const getWorkingHoursForDay = (day) => {
    const hours = workingHours[day];
    if (!hours || hours.length === 0) return null;
    return hours.map((range) => {
      const [start, end] = range.split(" - ");
      return { min: convertTo24Hour(start), max: convertTo24Hour(end) };
    });
  };

  // Initialize time range when modal opens or selectedEvent changes
  useEffect(() => {
    if (showEventDetailsModal && selectedEvent && selectedEvent.start) {
      const eventDate = new Date(selectedEvent.start);
      const dayOfWeek = eventDate.toLocaleString("en-US", { weekday: "long" });
      const workingTimeSlots = getWorkingHoursForDay(dayOfWeek);
      if (!workingTimeSlots) {
        setIsWorkingDay(false);
        setTimeRange([]); // Non-working day
      } else {
        setIsWorkingDay(true);
        setTimeRange(workingTimeSlots);
      }
    }
  }, [showEventDetailsModal, selectedEvent, workingHours]);

  // Fetch services from the API on mount
  useEffect(() => {
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
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  // Fetch client data using staff._id
  useEffect(() => {
    if (!staff?._id) return; // Ensure staff._id is available
    const fetchClients = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/clientelle/providerClient/${staff._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch client data");
        const data = await response.json();
        console.log("Clients Data fetched:", data);
        setClients(data);
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };
    fetchClients();
  }, [staff?._id]);

  // Filter only services assigned to the staff
  const filteredServices =
    staffservices && staffservices.length > 0
      ? services.filter((s) => staffservices.includes(s._id))
      : services;

  // Handle date change and update working hours accordingly
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const dayOfWeek = new Date(newDate).toLocaleString("en-US", {
      weekday: "long",
    });
    const workingTime = getWorkingHoursForDay(dayOfWeek);
    if (!workingTime) {
      setIsWorkingDay(false);
      alert("This date is not a working day. Please select another date.");
      return;
    }
    setIsWorkingDay(true);
    setTimeRange(workingTime);
    const [startHour, startMinute] = workingTime[0].min.split(":");
    const [endHour, endMinute] = workingTime[0].max.split(":");
    const startDateLocal = new Date(newDate);
    startDateLocal.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
    const endDateLocal = new Date(newDate);
    endDateLocal.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
    setSelectedEvent({
      ...selectedEvent,
      start: startDateLocal,
      end: endDateLocal,
    });
  };

  // Handle time changes for start/end times
  const handleTimeChange = (e, field) => {
    const newTime = e.target.value;
    const [hour, minute] = newTime.split(":");
    const newDateTime = new Date(selectedEvent.start);
    newDateTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
    setSelectedEvent({
      ...selectedEvent,
      [field]: newDateTime,
    });
  };

  // Save the event details after validation
  const handleSave = () => {
    if (!selectedEvent.clientName || !selectedEvent.clientId || !selectedEvent.serviceType) {
      alert("Please fill the form");
      return;
    }
    if (!isWorkingDay) {
      alert("You cannot save an event on a non-working day.");
      return;
    }
    handleUpdateEvent();
  };

  // Helper: Format a date string to HH:MM for input[type="time"]
  const formatTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (!showEventDetailsModal || !selectedEvent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Event Details</h2>

        {/* Client Dropdown */}
        <label className="block text-gray-700 font-semibold">Client:</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={
            clients.find((client) => client.username === selectedEvent.clientName)
              ?._id || ""
          }
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedClient = clients.find((client) => client._id === selectedId);
            if (selectedClient) {
              setSelectedEvent({
                ...selectedEvent,
                clientName: selectedClient.username,
                clientId: selectedClient._id,
              });
            }
          }}
        >
          <option value="">Select a Client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.username}
            </option>
          ))}
        </select>

        {/* Service Dropdown */}
        <label className="block text-gray-700 font-semibold">Service:</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={
            services.find((s) => s.name === selectedEvent.serviceType)?._id || ""
          }
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedService = services.find((s) => s._id === selectedId);
            if (selectedService) {
              setSelectedEvent({
                ...selectedEvent,
                serviceType: selectedService.name,
                serviceCharges: selectedService.price,
              });
            } else {
              setSelectedEvent({
                ...selectedEvent,
                serviceType: "",
                serviceCharges: "",
              });
            }
          }}
          disabled={filteredServices.length === 0}
        >
          <option value="">Select a Service</option>
          {filteredServices.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>

        {/* Charges (auto-populated based on service selection) */}
        <label className="block text-gray-700 font-semibold">Charges:</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.serviceCharges}
          readOnly
        />

        {/* Date Input */}
        <label className="block text-gray-700 font-semibold">Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded mb-2"
          value={
            selectedEvent.start
              ? new Date(selectedEvent.start).toISOString().split("T")[0]
              : ""
          }
          onChange={handleDateChange}
        />

        {/* Time Inputs (only show if it's a working day) */}
        {isWorkingDay && timeRange.length > 0 && (
          <>
            <label className="block text-gray-700 font-semibold">Start Time:</label>
            <input
              type="time"
              className="w-full p-2 border rounded mb-2"
              value={formatTimeForInput(selectedEvent.start)}
              min={timeRange[0].min}
              max={timeRange[0].max}
              disabled={!isWorkingDay}
              onChange={(e) => handleTimeChange(e, "start")}
            />

            <label className="block text-gray-700 font-semibold">End Time:</label>
            <input
              type="time"
              className="w-full p-2 border rounded mb-2"
              value={formatTimeForInput(selectedEvent.end)}
              min={timeRange[0].min}
              max={timeRange[0].max}
              disabled={!isWorkingDay}
              onChange={(e) => handleTimeChange(e, "end")}
            />
          </>
        )}

        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => setShowEventDetailsModal(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={!isWorkingDay}
          >
            Save
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleDeleteEvent}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
