import React, { useEffect, useState } from "react";

const provinceCityMap = {
  ON: { name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton", "London"] },
  AL: { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer"] },
  BC: { name: "British Columbia", cities: ["Vancouver", "Victoria", "Kelowna"] },
  QC: { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval"] },
  MB: { name: "Manitoba", cities: ["Winnipeg"] },
  NB: { name: "New Brunswick", cities: ["Fredericton", "Moncton"] },
  NL: { name: "Newfoundland and Labrador", cities: ["St. John's"] },
  NS: { name: "Nova Scotia", cities: ["Halifax"] },
  PE: { name: "Prince Edward Island", cities: ["Charlottetown"] },
  SK: { name: "Saskatchewan", cities: ["Saskatoon", "Regina"] }
};

const EditClientModal = ({ updatedClient, setUpdatedClient, handleUpdate, onCancel }) => {
  // State for first and last name
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Initialize first and last name from username when component mounts or username changes
  useEffect(() => {
    if (updatedClient.username) {
      const nameParts = updatedClient.username.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
    }
  }, [updatedClient.username]);

  // Get the available cities based on the selected province
  const availableCities =
    updatedClient.province && provinceCityMap[updatedClient.province]
      ? provinceCityMap[updatedClient.province].cities
      : [];

  // Handle form submission: prevent default and convert dateOfBirth to a Date object
  const onFormSubmit = (e) => {
    e.preventDefault();
    
    // Combine first and last name into username
    const fullUsername = `${firstName} ${lastName}`.trim();
    
    const convertedDOB = updatedClient.dateOfBirth
      ? new Date(updatedClient.dateOfBirth)
      : null;

    const updatedData = {
      ...updatedClient,
      username: fullUsername,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: convertedDOB
    };

    // Pass the updated data to the parent's handleUpdate
    handleUpdate(updatedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full">
        <h3 className="text-xl font-semibold mb-4">Edit Client</h3>
        <form onSubmit={onFormSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={updatedClient.email}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, email: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={updatedClient.phone}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Province Dropdown */}
              <div>
                <label className="block text-gray-700">Province</label>
                <select
                  name="province"
                  value={updatedClient.province}
                  onChange={(e) =>
                    setUpdatedClient({
                      ...updatedClient,
                      province: e.target.value,
                      city: ""
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Province</option>
                  {Object.keys(provinceCityMap).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              {/* City Dropdown */}
              <div>
                <label className="block text-gray-700">City</label>
                <select
                  name="city"
                  value={updatedClient.city}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, city: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  disabled={!updatedClient.province}
                >
                  <option value="">
                    {updatedClient.province ? "Select City" : "Select a province first"}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Middle Column */}
            <div className="flex-1 space-y-4">
              {/* Address 1 */}
              <div>
                <label className="block text-gray-700">Address 1</label>
                <input
                  type="text"
                  value={updatedClient.address1}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, address1: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Address 2 */}
              <div>
                <label className="block text-gray-700">Address 2</label>
                <input
                  type="text"
                  value={updatedClient.address2}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, address2: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Postal Code */}
              <div>
                <label className="block text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={updatedClient.postalCode}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, postalCode: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Date of Birth as Date Picker */}
              <div>
                <label className="block text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={updatedClient.dateOfBirth ? new Date(updatedClient.dateOfBirth).toISOString().split("T")[0] : ""}

                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, dateOfBirth: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Age Range */}
              <div>
                <label className="block text-gray-700">Age Range</label>
                <input
                  type="text"
                  value={updatedClient.ageRange}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, ageRange: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Occupation */}
              <div>
                <label className="block text-gray-700">Occupation</label>
                <input
                  type="text"
                  value={updatedClient.occupation}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, occupation: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-4">
              {/* Hobbies */}
              <div>
                <label className="block text-gray-700">Hobbies</label>
                <input
                  type="text"
                  value={updatedClient.hobbies}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, hobbies: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Hair Color */}
              <div>
                <label className="block text-gray-700">Hair Color</label>
                <input
                  type="text"
                  value={updatedClient.hairColor}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, hairColor: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Referred By */}
              <div>
                <label className="block text-gray-700">Referred By</label>
                <input
                  type="text"
                  value={updatedClient.referredBy}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, referredBy: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Family Details */}
              <div>
                <label className="block text-gray-700">Family Details</label>
                <textarea
                  value={updatedClient.familyDetails}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, familyDetails: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              {/* Additional Details - Now in the right column */}
              <div>
                <label className="block text-gray-700">Additional Details</label>
                <textarea
                  value={updatedClient.additionalDetails || ""}
                  onChange={(e) =>
                    setUpdatedClient({ ...updatedClient, additionalDetails: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  rows="4"
                  placeholder="Any other information about the client..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Update Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;