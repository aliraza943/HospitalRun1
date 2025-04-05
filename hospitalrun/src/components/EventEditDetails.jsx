import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventDetailsModal = ({
  showEventDetailsModal,
  selectedEvent,
  setSelectedEvent,
  setShowEventDetailsModal,
  handleUpdateEvent,
  handleDeleteEvent,
  workingHours,
  staffservices,
  staff,
}) => {
  const [timeRange, setTimeRange] = useState([{ min: "09:00", max: "18:00" }]);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);

  const convertTo24Hour = (time) => {
    const [hours, minutes] = time.split(":");
    const [min, period] = minutes.split(" ");
    let hour24 = parseInt(hours, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${min}`;
  };

  const getWorkingHoursForDay = (day) => {
    const hours = workingHours[day];
    if (!hours || hours.length === 0) return null;
    return hours.map((range) => {
      const [start, end] = range.split(" - ");
      return { min: convertTo24Hour(start), max: convertTo24Hour(end) };
    });
  };

  const calculateDuration = (start, end) => {
    return (new Date(end) - new Date(start)) / (1000 * 60);
  };

  useEffect(() => {
    if (showEventDetailsModal && selectedEvent && selectedEvent.start) {
      const eventDate = new Date(selectedEvent.start);
      const dayOfWeek = eventDate.toLocaleString("en-US", { weekday: "long" });
      const workingTimeSlots = getWorkingHoursForDay(dayOfWeek);
      if (!workingTimeSlots) {
        setIsWorkingDay(false);
        setTimeRange([]);
      } else {
        setIsWorkingDay(true);
        setTimeRange(workingTimeSlots);
      }
    }
  }, [showEventDetailsModal, selectedEvent, workingHours]);

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

  useEffect(() => {
    if (!staff?._id) return;
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
        setClients(data);
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };
    fetchClients();
  }, [staff?._id]);

  const filteredServices =
    staffservices && staffservices.length > 0
      ? services.filter((s) => staffservices.includes(s._id))
      : services;

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const dayOfWeek = new Date(newDate).toLocaleString("en-US", {
      weekday: "long",
    });
    const workingTime = getWorkingHoursForDay(dayOfWeek);
    if (!workingTime) {
      setIsWorkingDay(false);
      toast.error("This date is not a working day. Please select another date.");
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

  const confirmAndSubmit = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>This is not the expected duration for this service. Are you sure?</p>
          <div className="flex justify-between mt-2">
            <button
              onClick={() => {
                handleUpdateEvent();
                closeToast();
              }}
              style={{
                backgroundColor: "#4CAF50",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "3px",
              }}
            >
              OK
            </button>
            <button
              onClick={closeToast}
              style={{
                backgroundColor: "#d9534f",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "3px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
      }
    );
  };

  const handleSave = () => {
    if (
      !selectedEvent.clientName ||
      !selectedEvent.clientId ||
      !selectedEvent.serviceType ||
      !selectedEvent.description
    ) {
      toast.error("Please fill the form");
      return;
    }

    if (!isWorkingDay) {
      toast.error("You cannot save an event on a non-working day.");
      return;
    }

    if (new Date(selectedEvent.start) >= new Date(selectedEvent.end)) {
      toast.error("Start time must be before end time.");
      return;
    }

    if (selectedEvent.start && selectedEvent.end) {
      const duration = calculateDuration(selectedEvent.start, selectedEvent.end);
      const expectedDuration = selectedEvent.serviceDuration || 40;
      if (duration !== expectedDuration) {
        confirmAndSubmit();
        return;
      }
    }

    handleUpdateEvent();
  };

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
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Event Details</h2>

        {/* Client Dropdown */}
        <label className="block text-gray-700 font-semibold">Client:</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={clients.find((client) => client.username === selectedEvent.clientName)?._id || ""}
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
          value={services.find((s) => s.name === selectedEvent.serviceType)?._id || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedService = services.find((s) => s._id === selectedId);
            if (selectedService) {
              setSelectedEvent({
                ...selectedEvent,
                serviceType: selectedService.name,
                serviceCharges: selectedService.price,
                serviceId: selectedService._id,
                serviceDuration: selectedService.duration || 40,
              });
            } else {
              setSelectedEvent({
                ...selectedEvent,
                serviceType: "",
                serviceCharges: "",
                serviceId: "",
                serviceDuration: 40,
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

        {/* Charges */}
        <label className="block text-gray-700 font-semibold">Charges:</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.serviceCharges}
          readOnly
        />

        {/* Description */}
        <label className="block text-gray-700 font-semibold">Description:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter description"
          value={selectedEvent.description || ""}
          onChange={(e) =>
            setSelectedEvent({ ...selectedEvent, description: e.target.value })
          }
          required
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
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
            onClick={() => setShowEventDetailsModal(false)}
          >
            Close
          </button>

          <button
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            onClick={handleDeleteEvent}
          >
            Cancel Appointment
          </button>

          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            onClick={handleSave}
            disabled={!isWorkingDay}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
