import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientDetailsData from "./ClientDetailsData";
import ClientGallery from "./ClientGallery";

const ClientProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client;
  const [activeTab, setActiveTab] = useState("details");
  console.log(client)

  if (!client) {
    return (
      <p className="text-center mt-4 text-red-500">
        Client not found!
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Client Profile</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
      {/* Selection Bar */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 focus:outline-none ${
            activeTab === "details"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-600"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2 focus:outline-none ${
            activeTab === "gallery"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-600"
          }`}
        >
          Gallery
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "details" ? (
        <ClientDetailsData client={client} />
      ) : (
        <ClientGallery client={client} />
      )}
    </div>
  );
};

export default ClientProfile;
