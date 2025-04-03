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
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Service</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Start Time</th>
              <th className="px-4 py-2 border">End Time</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Staff</th>
              <th className="px-4 py-2 border">Total Bill</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              // Extract date, start time, and end time separately
              const startDate = new Date(appointment.start);
              const endDate = new Date(appointment.end);

              const date = startDate.toLocaleDateString(); // Format: MM/DD/YYYY
              const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              // Apply conditional styling based on appointment status
              let rowStyle = "";
              if (appointment.status === "booked") {
                rowStyle = "bg-green-100";
              } else if (appointment.status === "cancelled") {
                rowStyle = "bg-red-100";
              } else if (appointment.status === "completed") {
                rowStyle = "bg-blue-100";
              }

              return (
                <tr key={appointment._id} className={`${rowStyle} text-center`}>
                  <td className="px-4 py-2 border">{appointment.serviceName}</td>
                  <td className="px-4 py-2 border">{date}</td>
                  <td className="px-4 py-2 border">{startTime}</td>
                  <td className="px-4 py-2 border">{endTime}</td>
                  <td className="px-4 py-2 border capitalize">{appointment.status}</td>
                  <td className="px-4 py-2 border">
                    {appointment.staffId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">${appointment.totalBill}</td>
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
