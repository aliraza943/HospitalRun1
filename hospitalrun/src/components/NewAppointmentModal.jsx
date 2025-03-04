import React, { useEffect, useState } from "react";

const NewAppointmentModal = ({
  newEvent,
  setNewEvent,
  handleSubmitEvent,
  onCancel,
  staff
}) => {
  const [serviceTypes, setServiceTypes] = useState([]);

  // Log newEvent data every time it updates
  useEffect(() => {
    console.log("Current newEvent data:", newEvent);
  }, [newEvent]);

  // Fetch service types from the API when the component mounts
  useEffect(() => {
    const fetchAPIData = async () => {
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
        if (!response.ok) {
          throw new Error(response.message);
        }
        const data = await response.json();
        console.log("API Data fetched in NewAppointmentModal:", data);
        setServiceTypes(data);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchAPIData();
  }, []);

  // Filter the service types based on the staff's services field.
  // Only show those services whose _id is included in staff.services.
  const filteredServiceTypes = staff && staff.services && staff.services.length > 0 
    ? serviceTypes.filter((service) => staff.services.includes(service._id))
    : serviceTypes;

  // Handler for service type dropdown change
  const handleServiceTypeChange = (e) => {
    const selectedId = e.target.value;
    // Find the selected service object by its _id
    const selectedService = serviceTypes.find(
      (service) => service._id === selectedId
    );
    if (selectedService) {
      setNewEvent({
        ...newEvent,
        serviceType: selectedService.name, // set the service name
        charges: selectedService.price, // update charges based on price
      });
      console.log(
        "Service Type selected:",
        selectedService.name,
        "Price:",
        selectedService.price
      );
    } else {
      // If no valid selection, clear the fields
      setNewEvent({
        ...newEvent,
        serviceType: "",
        charges: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">New Appointment</h2>

        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={newEvent.title}
          onChange={(e) => {
            setNewEvent({ ...newEvent, title: e.target.value });
            console.log("Title updated:", e.target.value);
          }}
        />

        <label className="block text-sm font-medium mb-1">Client Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={newEvent.clientName}
          onChange={(e) => {
            setNewEvent({ ...newEvent, clientName: e.target.value });
            console.log("Client Name updated:", e.target.value);
          }}
        />

        {/* Dropdown for Service Type */}
        <label className="block text-sm font-medium mb-1">Service Type</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={
            // If newEvent.serviceType holds the name, find the matching service _id.
            serviceTypes.find(
              (service) => service.name === newEvent.serviceType
            )?._id || ""
          }
          onChange={handleServiceTypeChange}
        >
          <option value="">Select a Service Type</option>
          {filteredServiceTypes.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>

        {/* Charges field, auto-populated from selected service type */}
        <label className="block text-sm font-medium mb-1">Charges</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-4"
          value={newEvent.charges}
          readOnly
        />

        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSubmitEvent}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
