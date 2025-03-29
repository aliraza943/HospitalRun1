import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// Map of province codes to their full names and corresponding cities
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

// Get an array of province codes to iterate over
const provinceCodes = Object.keys(provinceCityMap);

// Age ranges
const ageRanges = [
  "<20",
  "20 to 29",
  "30 to 39",
  "40 to 49",
  "50 to 59",
  "60 to 69",
  "70 to 79"
];

// Create arrays for day, month, and year dropdowns
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

const AddClienteleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const providerId = location.state?.providerId;

  // Initial state with new fields.
  // The date of birth is split into day, month, and year dropdown selections.
  // Additional optional fields: hobbies, hairColor, and referredBy.
  const initialClientState = {
    firstName: "Test",
    lastName: "User",
    email: "test@gmail.com",
    phone: "1234567",
    address1: "Address Line 1",
    address2: "",
    city: "",
    province: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    familyDetails: "",
    ageRange: "",
    occupation: "",
    postalCode: "",
    hobbies: "",
    hairColor: "",
    referredBy: "",
    ...(providerId ? { providerId } : {})
  };

  const [client, setClient] = useState(initialClientState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes; reset city if province changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "province") {
      setClient((prev) => ({ ...prev, province: value, city: "" }));
    } else {
      setClient((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission.
  // Combine firstName and lastName into "name" and the DOB dropdowns into a Date object.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Create a Date object from the DOB dropdowns
    const dob = new Date(client.dobYear, client.dobMonth - 1, client.dobDay);
    
    const dataToSend = {
      ...client,
      name: `${client.firstName} ${client.lastName}`,
      dateOfBirth: dob.toISOString() // send in ISO format
    };

    // Remove fields that are no longer needed
    delete dataToSend.firstName;
    delete dataToSend.lastName;
    delete dataToSend.dobDay;
    delete dataToSend.dobMonth;
    delete dataToSend.dobYear;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/clientelle/add",
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      setMessage(response.data.message);
      setClient(initialClientState);
      setTimeout(() => {
        navigate(providerId ? "/adminViewClientele" : "/providerViewClientele");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add client!");
    } finally {
      setLoading(false);
    }
  };

  // Get the cities based on the selected province code
  const availableCities =
    client.province && provinceCityMap[client.province]
      ? provinceCityMap[client.province].cities
      : [];

  return (
    // Scrollable container with a wider width.
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

      {message && (
        <div
          className={`p-3 mb-4 text-white rounded ${
            message.includes("success") ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Flex container for side-by-side layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Required Information */}
          <fieldset className="flex-1 border p-4 rounded">
            <legend className="text-lg font-semibold mb-2">
              Required Information
            </legend>
            {/* First Name */}
            <div className="mb-4">
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={client.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={client.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={client.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </fieldset>

          {/* Optional Information */}
          <fieldset className="flex-1 border p-4 rounded">
            <legend className="text-lg font-semibold mb-2">
              Optional Information
            </legend>
            {/* Address 1 */}
            <div className="mb-4">
              <label className="block text-gray-700">Address 1</label>
              <input
                type="text"
                name="address1"
                value={client.address1}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            {/* Address 2 */}
            <div className="mb-4">
              <label className="block text-gray-700">Address 2</label>
              <input
                type="text"
                name="address2"
                value={client.address2}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            {/* Province Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700">Province</label>
              <select
                name="province"
                value={client.province}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Province</option>
                {provinceCodes.map((code) => (
                  <option key={code} value={code}>
                    {provinceCityMap[code].name} ({code})
                  </option>
                ))}
              </select>
            </div>
            {/* City Dropdown (linked to province) */}
            <div className="mb-4">
              <label className="block text-gray-700">City</label>
              <select
                name="city"
                value={client.city}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={!client.province}
              >
                <option value="">
                  {client.province ? "Select City" : "Select a province first"}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            {/* Date of Birth: Day, Month, Year Dropdowns */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="flex gap-2">
                {/* Day Dropdown */}
                <select
                  name="dobDay"
                  value={client.dobDay}
                  onChange={handleChange}
                  className="w-1/3 p-2 border rounded"
                >
                  <option value="">Day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                {/* Month Dropdown */}
                <select
                  name="dobMonth"
                  value={client.dobMonth}
                  onChange={handleChange}
                  className="w-1/3 p-2 border rounded"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                {/* Year Dropdown */}
                <select
                  name="dobYear"
                  value={client.dobYear}
                  onChange={handleChange}
                  className="w-1/3 p-2 border rounded"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Family Details */}
            <div className="mb-4">
              <label className="block text-gray-700">Family Details</label>
              <textarea
                name="familyDetails"
                value={client.familyDetails}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
              ></textarea>
            </div>
            {/* Age Range Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700">Age Range</label>
              <select
                name="ageRange"
                value={client.ageRange}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Age Range</option>
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
            {/* Occupation */}
            <div className="mb-4">
              <label className="block text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={client.occupation}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            {/* Postal Code */}
            <div className="mb-4">
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={client.postalCode}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            {/* Hobbies */}
            <div className="mb-4">
              <label className="block text-gray-700">Hobbies</label>
              <input
                type="text"
                name="hobbies"
                value={client.hobbies}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., Reading, Hiking"
              />
            </div>
            {/* Hair Color */}
            <div className="mb-4">
              <label className="block text-gray-700">Hair Color</label>
              <input
                type="text"
                name="hairColor"
                value={client.hairColor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., Blonde, Brunette"
              />
            </div>
            {/* Referred By */}
            <div>
              <label className="block text-gray-700">Referred By</label>
              <input
                type="text"
                name="referredBy"
                value={client.referredBy}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Name of the referrer"
              />
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Client"}
        </button>
      </form>
    </div>
  );
};

export default AddClienteleForm;
