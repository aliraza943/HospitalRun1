import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AddStaffForm from '../../components/AddStaffForm';
import AddServiceForm from '../../components/AddServicesForm';
;

const AddServices = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <AddServiceForm />
                </div>
            </div>
        </div>
    );
};

export default AddServices;
