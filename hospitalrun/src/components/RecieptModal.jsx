import React, { useState } from "react";

const ReceiptModal = ({ appointment, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const markAsCompleted = async () => {
    setLoading(true);
    console.log(appointment._id);
    try {
      const response = await fetch(
        `http://localhost:8080/api/staff/appointments/markAsComplete/${appointment._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark as completed");
      }

      alert("Appointment marked as completed successfully!");
      onClose(); // Close the modal after success
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full font-mono text-sm border border-gray-300">
        {/* Receipt Header */}
        <div className="text-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold">Business Name</h2>
          <p className="text-gray-600">123 Main Street, City, State</p>
          <p className="text-gray-600">Phone: (123) 456-7890</p>
        </div>

        {/* Receipt Details Table */}
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-bold">Client</td>
              <td className="p-2">{appointment.clientName}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold">Service</td>
              <td className="p-2">{appointment.serviceName}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold">Date</td>
              <td className="p-2">
                {new Date(appointment.start).toLocaleDateString()}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold">Start Time</td>
              <td className="p-2">
                {new Date(appointment.start).toLocaleTimeString()}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold">End Time</td>
              <td className="p-2">
                {new Date(appointment.end).toLocaleTimeString()}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold">Service Charges</td>
              <td className="p-2">{formatCurrency(appointment.serviceCharges)}</td>
            </tr>

            {/* Taxes */}
            {appointment.taxesApplied && appointment.taxesApplied.length > 0 && (
              <>
                <tr className="border-b">
                  <td className="p-2 font-bold" colSpan="2">
                    Taxes Applied
                  </td>
                </tr>
                {appointment.taxesApplied.map((tax, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      {tax.taxType} ({(tax.percentage * 100).toFixed(0)}%)
                    </td>
                    <td className="p-2">{formatCurrency(tax.amount)}</td>
                  </tr>
                ))}
              </>
            )}

            <tr className="border-b">
              <td className="p-2 font-bold">Total Tax</td>
              <td className="p-2">{formatCurrency(appointment.totalTax)}</td>
            </tr>
            <tr className="border-b font-bold">
              <td className="p-2">Total Bill</td>
              <td className="p-2">{formatCurrency(appointment.totalBill)}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold">Status</td>
              <td className="p-2">{appointment.status}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t mt-4 pt-2 text-center text-gray-600 text-xs">
          <p>Thank you for your business!</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          {appointment.status !== "completed" && (
            <button
              className={`px-4 py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-green-500"
              }`}
              onClick={markAsCompleted}
              disabled={loading}
            >
              {loading ? "Processing..." : "Mark as Completed"}
            </button>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
