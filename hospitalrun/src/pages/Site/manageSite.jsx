import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import AddStaffForm from '../../components/ViewWeb';
;

const AddStaff = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
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
