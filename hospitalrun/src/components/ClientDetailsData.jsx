import React from "react";

const ClientDetailsData = ({ client }) => {
  // Updated helper function to handle empty strings
  const getValue = (value) => {
    if (typeof value === "string") {
      return value.trim() ? value : "Not mentioned";
    }
    return value ? value : "Not mentioned";
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Section: General Details */}
      <div className="flex-1 space-y-3">
        <p>
          <strong>Username:</strong> {getValue(client.username)}
        </p>
        <p>
          <strong>Email:</strong> {getValue(client.email)}
        </p>
        <p>
          <strong>Phone:</strong> {getValue(client.phone)}
        </p>
        <p>
          <strong>Address Line 1:</strong> {getValue(client.address1)}
        </p>
        <p>
          <strong>Address Line 2:</strong> {getValue(client.address2)}
        </p>
        <p>
          <strong>City:</strong> {getValue(client.city)}
        </p>
        <p>
          <strong>Province:</strong> {getValue(client.province)}
        </p>
        <p>
          <strong>Postal Code:</strong> {getValue(client.postalCode)}
        </p>
        <p>
          <strong>Business ID:</strong> {getValue(client.businessId)}
        </p>
        <p>
          <strong>Provider ID:</strong> {getValue(client.providerId)}
        </p>
        <p>
          <strong>Referred By:</strong> {getValue(client.referredBy)}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {client.createdAt
            ? new Date(client.createdAt).toLocaleString()
            : "Not mentioned"}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {client.updatedAt
            ? new Date(client.updatedAt).toLocaleString()
            : "Not mentioned"}
        </p>
      </div>

      {/* Right Section: Personal Details */}
      <div className="flex-1 space-y-3">
        <p>
          <strong>Birthday:</strong>{" "}
          {client.dateOfBirth
            ? new Date(client.dateOfBirth).toLocaleDateString()
            : "Not mentioned"}
        </p>
        <p>
          <strong>Age Range:</strong> {getValue(client.ageRange)}
        </p>
        <p>
          <strong>Family Details:</strong> {getValue(client.familyDetails)}
        </p>
        <p>
          <strong>Hair Color:</strong> {getValue(client.hairColor)}
        </p>
        <p>
          <strong>Occupation:</strong> {getValue(client.occupation)}
        </p>
        <p>
          <strong>Hobbies:</strong> {getValue(client.hobbies)}
        </p>
        <p>
          <strong>Additional Details:</strong> {getValue(client.additionalDetails)}
        </p>
      </div>
    </div>
  );
};

export default ClientDetailsData;
