import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AppointmentHandler from '../../components/AppointmentHandler'
;

const ViewSchedule = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <AppointmentHandler />
                </div>
            </div>
        </div>
    );
};

export default ViewSchedule;
