import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AddStaffForm from '../../components/ClientDetails';

const AddStaff = () => {
    return (
        // This flex container will stretch its children based on content height.
        <div className="flex items-stretch min-h-screen">
            {/* Sidebar */}
            <div className="flex-shrink-0">
                <SidebarComp />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <AddStaffForm />
                </div>
            </div>
        </div>
    );
};

export default AddStaff;
