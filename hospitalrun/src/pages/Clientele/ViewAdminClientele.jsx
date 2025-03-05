import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import ViewServicesComp from '../../components/AdminViewClientele';
;

const ViewAdminClientele = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <ViewServicesComp />
                </div>
            </div>
        </div>
    );
};

export default ViewAdminClientele;
