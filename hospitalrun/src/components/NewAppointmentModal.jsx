import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewAppointmentModal = ({
  newEvent,
  setNewEvent,
  handleSubmitEvent,
  onCancel,
  staff,
}) => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [clients, setClients] = useState([]);

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
          throw new Error("Failed to fetch services");
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

  // Fetch Client Data using staff.id
  useEffect(() => {
    if (!staff?._id) return; // Ensure staff.id is available

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
        if (!response.ok) {
          throw new Error("Failed to fetch client data");
        }
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
  const filteredServiceTypes = serviceTypes.filter((service) =>
    staff?.services?.includes(service._id)
  );

  // Handler for service type dropdown change with duration added to start time
  const handleServiceTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedService = serviceTypes.find(
      (service) => service._id === selectedId
    );
    if (selectedService) {
      // Ensure newEvent.start exists and parse it as a Date
      const startDate = new Date(newEvent.start);
      // Assuming service duration is in minutes:
      const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
      setNewEvent({
        ...newEvent,
        serviceType: selectedService.name, // set the service name
        charges: selectedService.price, // update charges based on price
        serviceId: selectedService._id, // send the service ID as well
        duration: selectedService.duration, // store duration in minutes
        end: endDate, // computed end time from duration
      });
      console.log(
        "Service Type selected:",
        selectedService.name,
        "Price:",
        selectedService.price,
        "Duration:",
        selectedService.duration,
        "Computed End Time:",
        endDate
      );
    } else {
      setNewEvent({
        ...newEvent,
        serviceType: "",
        charges: "",
        serviceId: "",
        duration: "",
        end: "",
      });
    }
  };

  // Handler for client dropdown change
  const handleClientChange = (e) => {
    const selectedId = e.target.value;
    const selectedClient = clients.find((client) => client._id === selectedId);
    if (selectedClient) {
      setNewEvent({
        ...newEvent,
        clientName: selectedClient.username,
        title: selectedClient.username, // Automatically set title to client name
        clientId: selectedClient._id, // Store client ID as well
      });
      console.log("Selected Client:", selectedClient.username);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">New Appointment</h2>

        <label className="block text-sm font-medium mb-1">Client Name</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={
            clients.find((client) => client.username === newEvent.clientName)
              ?._id || ""
          }
          onChange={handleClientChange}
        >
          <option value="">Select a Client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.username}
            </option>
          ))}
        </select>

        {/* Show message if no services are assigned */}
        {filteredServiceTypes.length === 0 && (
          <p className="text-red-500 text-sm mb-1">
            The services for this user have not been set.
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Service Type</label>
        <select
          className="w-full p-2 border rounded mb-2"
          value={newEvent.serviceId || ""}
          onChange={handleServiceTypeChange}
          disabled={filteredServiceTypes.length === 0} // Disable if no services exist
        >
          <option value="">Select a Service Type</option>
          {filteredServiceTypes.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Charges</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-4"
          value={newEvent.charges}
          readOnly
        />

        {/* Display the duration */}
        <label className="block text-sm font-medium mb-1">
          Duration (minutes)
        </label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-4"
          value={newEvent.duration || ""}
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
            onClick={() => {
              if (filteredServiceTypes.length === 0) {
                toast.error("The services for this user have not been set.");
                return;
              }
              // Check if the appointment start and end times are in the past
              const now = new Date();
              const startTime = new Date(newEvent.start);
              const endTime = new Date(newEvent.end);
              if (startTime < now || endTime < now) {
                toast.error("Cannot save an appointment in the past.");
                return;
              }
              handleSubmitEvent();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
