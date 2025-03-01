import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AddStaffForm from '../../components/AddStaffForm';
import ViewStaffAppointmentsComp from '../../components/ViewStaffAppointments';

const ViewStaff = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <ViewStaffAppointmentsComp />
                </div>
            </div>
        </div>
    );
};

export default ViewStaff;
