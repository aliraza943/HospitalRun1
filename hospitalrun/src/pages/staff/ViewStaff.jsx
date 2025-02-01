import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AddStaffForm from '../../components/AddStaffForm';
import ViewStaffComp from '../../components/ViewStaffComp';
;

const ViewStaff = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <ViewStaffComp />
                </div>
            </div>
        </div>
    );
};

export default ViewStaff;
