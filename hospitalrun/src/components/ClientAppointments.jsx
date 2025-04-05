import React, { useState, useEffect } from "react";

const ClientAppointments = ({ client }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Fetch appointments using the client's _id
        const response = await fetch(`http://localhost:8080/api/checkout/client/${client._id}/appointments`);
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();
        console.log(data);
        // Assuming the appointments are returned in the "data" property
        setAppointments(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (client && client._id) {
      fetchAppointments();
    }
  }, [client]);

  if (loading) {
    return <p>Loading appointments...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-center flex-1">Date</th>
              <th className="px-4 py-2 text-center flex-1">Status</th>
              <th className="px-4 py-2 text-center flex-1">Description</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              // Extract the start date from the appointment's start property
              const startDate = new Date(appointment.start);
              const formattedDate = startDate.toLocaleDateString(); // Format: MM/DD/YYYY

              // Determine status text based on the appointment's status
              let statusText = "";
              switch (appointment.status) {
                case "booked":
                  statusText = "Appointment Booked";
                  break;
                case "cancelled":
                  statusText = "Appointment Cancelled";
                  break;
                case "completed":
                  statusText = "Appointment Completed";
                  break;
                default:
                  statusText = "Appointment Status Unknown";
              }

              return (
                <tr key={appointment._id} className="text-center">
                  <td className="px-4 py-2">{formattedDate}</td>
                  <td className="px-4 py-2">{statusText}</td>
                  <td className="px-4 py-2">
                    {appointment.description || "—"} {/* Show description or default "—" */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientAppointments;
