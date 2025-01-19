import React from 'react';

const Notification = () => {
    return (
        <div className="notification-container bg-white shadow-lg rounded-lg p-4 mt-8">
            {/* Notification Header */}
            <div className="notification-header flex justify-between items-center mb-4 bg-gray-200 p-3 rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                <button className="text-blue-500 hover:text-blue-700 text-sm">Clear All Notifications</button>
            </div>

            {/* Notification Body */}
            <div className="notification-body space-y-4">
                {/* Notification Item */}
                <div className="notification-item flex justify-between items-center border-b pb-3">
                    {/* Time Column */}
                    <div className="time w-1/4 text-gray-600 text-center">
                        01/30/2025 2:30 PM
                    </div>

                    {/* Details Column */}
                    <div className="details w-1/2 text-gray-800 text-center">
                        Appointment booked<br />
                        John Smith - Service<br />
                        02/25/2025 3pm to 4pm
                    </div>

                    {/* Action Buttons */}
                    <div className="actions w-1/4 flex justify-end space-x-4">
                        <button className="text-blue-500 hover:text-blue-700 text-sm">View Appointment</button>
                        <button className="text-red-500 hover:text-red-700 text-sm">Clear Notification</button>
                    </div>
                </div>
                <div className="notification-item flex justify-between items-center border-b pb-3">
                    {/* Time Column */}
                    <div className="time w-1/4 text-gray-600 text-center">
                        01/30/2025 2:30 PM
                    </div>

                    {/* Details Column */}
                    <div className="details w-1/2 text-gray-800 text-center">
                        Appointment booked<br />
                        John Smith - Service<br />
                        02/25/2025 3pm to 4pm
                    </div>

                    {/* Action Buttons */}
                    <div className="actions w-1/4 flex justify-end space-x-4">
                        <button className="text-blue-500 hover:text-blue-700 text-sm">View Appointment</button>
                        <button className="text-red-500 hover:text-red-700 text-sm">Clear Notification</button>
                    </div>
                </div>
                <div className="notification-item flex justify-between items-center border-b pb-3">
                    {/* Time Column */}
                    <div className="time w-1/4 text-gray-600 text-center">
                        01/30/2025 2:30 PM
                    </div>

                    {/* Details Column */}
                    <div className="details w-1/2 text-gray-800 text-center">
                        Appointment booked<br />
                        John Smith - Service<br />
                        02/25/2025 3pm to 4pm
                    </div>

                    {/* Action Buttons */}
                    <div className="actions w-1/4 flex justify-end space-x-4">
                        <button className="text-blue-500 hover:text-blue-700 text-sm">View Appointment</button>
                        <button className="text-red-500 hover:text-red-700 text-sm">Clear Notification</button>
                    </div>
                </div>

                {/* You can repeat the above "notification-item" for additional notifications */}
            </div>
        </div>
    );
};

export default Notification;
