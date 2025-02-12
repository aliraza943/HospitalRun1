import React, { useState, useEffect } from "react";

const EventDetailsModal = ({
  showEventDetailsModal,
  selectedEvent,
  setSelectedEvent,
  setShowEventDetailsModal,
  handleUpdateEvent,
  handleDeleteEvent,
  workingHours,
}) => {
  const [timeRange, setTimeRange] = useState({ min: "09:00", max: "18:00" });
  const [isWorkingDay, setIsWorkingDay] = useState(true);

  const convertTo24Hour = (time) => {
    const [hours, minutes] = time.split(":");
    const [minute, period] = minutes.split(" ");
    let hour24 = parseInt(hours, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${minute}`;
  };

  const getWorkingHoursForDay = (day) => {
    const hours = workingHours[day];
    if (!hours || hours.length === 0) return null;
    const [start, end] = hours[0].split(" - ");
    return { min: convertTo24Hour(start), max: convertTo24Hour(end) };
  };

  // Initialize time range when modal opens or selected event changes
  useEffect(() => {
    if (showEventDetailsModal && selectedEvent && selectedEvent.start) {
      const eventDate = new Date(selectedEvent.start);
      const dayOfWeek = eventDate.toLocaleString("en-US", { weekday: "long" });
      const workingTime = getWorkingHoursForDay(dayOfWeek);
      
      if (!workingTime) {
        setIsWorkingDay(false);
        setTimeRange({ min: "09:00", max: "18:00" }); // Default values for non-working days
      } else {
        setIsWorkingDay(true);
        setTimeRange(workingTime);
      }
    }
  }, [showEventDetailsModal, selectedEvent, workingHours]);

  if (!showEventDetailsModal || !selectedEvent) return null;

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const dayOfWeek = new Date(newDate).toLocaleString("en-US", { weekday: "long" });
  
    const workingTime = getWorkingHoursForDay(dayOfWeek);
    if (!workingTime) {
      setIsWorkingDay(false);
      alert("This date is not a working day. Please select another date.");
      return;
    }
  
    setIsWorkingDay(true);
    setTimeRange(workingTime);
  
    // Preserve local time instead of converting to UTC
    const [startHour, startMinute] = workingTime.min.split(":");
    const [endHour, endMinute] = workingTime.max.split(":");
  
    const startDateLocal = new Date(newDate);
    startDateLocal.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
  
    const endDateLocal = new Date(newDate);
    endDateLocal.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
  
    setSelectedEvent({
      ...selectedEvent,
      start: startDateLocal, // Keep local time
      end: endDateLocal,
    });
  };
  
  const handleTimeChange = (e, field) => {
    const newTime = e.target.value;
    const eventDate = selectedEvent.start
      ? new Date(selectedEvent.start).toISOString().split("T")[0]
      : "";
  
    if (newTime < timeRange.min || newTime > timeRange.max) {
      alert(`Time must be between ${timeRange.min} and ${timeRange.max}.`);
      return;
    }
  
    const [hour, minute] = newTime.split(":");
  
    const newDateTime = new Date(selectedEvent.start);
    newDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
  
    setSelectedEvent({
      ...selectedEvent,
      [field]: newDateTime, // Keep local time without converting to UTC
    });
  };
  

  const handleSave = () => {
    if (!isWorkingDay) {
      alert("You cannot save an event on a non-working day.");
      return;
    }
    handleUpdateEvent();
  };

  // Helper function to format time in local time for input[type="time"]
  const formatTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Event Details</h2>

        {/* Title */}
        <label className="block text-gray-700 font-semibold">Title:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.title}
          onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
        />

        {/* Client */}
        <label className="block text-gray-700 font-semibold">Client:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.clientName}
          onChange={(e) => setSelectedEvent({ ...selectedEvent, clientName: e.target.value })}
        />

        {/* Service */}
        <label className="block text-gray-700 font-semibold">Service:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.serviceType}
          onChange={(e) => setSelectedEvent({ ...selectedEvent, serviceType: e.target.value })}
        />

        {/* Charges */}
        <label className="block text-gray-700 font-semibold">Charges:</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.serviceCharges}
          onChange={(e) => setSelectedEvent({ ...selectedEvent, serviceCharges: e.target.value })}
        />

        {/* Date Input */}
        <label className="block text-gray-700 font-semibold">Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded mb-2"
          value={selectedEvent.start ? new Date(selectedEvent.start).toISOString().split("T")[0] : ""}
          onChange={handleDateChange}
        />

        {/* Show time inputs only if it's a working day */}
        {isWorkingDay && (
          <>
            {/* Start Time */}
            <label className="block text-gray-700 font-semibold">Start Time:</label>
            <input
              type="time"
              className="w-full p-2 border rounded mb-2"
              value={formatTimeForInput(selectedEvent.start)}
              min={timeRange.min}
              max={timeRange.max}
              disabled={!isWorkingDay}
              onChange={(e) => handleTimeChange(e, "start")}
            />

            {/* End Time */}
            <label className="block text-gray-700 font-semibold">End Time:</label>
            <input
              type="time"
              className="w-full p-2 border rounded mb-2"
              value={formatTimeForInput(selectedEvent.end)}
              min={timeRange.min}
              max={timeRange.max}
              disabled={!isWorkingDay}
              onChange={(e) => handleTimeChange(e, "end")}
            />
          </>
        )}

        <div className="flex justify-between mt-4">
          <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowEventDetailsModal(false)}>
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={!isWorkingDay}>
            Save
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDeleteEvent}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;