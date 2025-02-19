import React from 'react';
import { useLocation } from 'react-router-dom';

const UnauthorizedPage = () => {
  const location = useLocation();
  const { message } = location.state || { message: "You are not authorized to access this page." };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 text-lg">{message}</p>
        <a href="/" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
