import React from 'react';
import SidebarComp from '../../components/Sidebar';
import Header from '../../components/Header';
import MyCalendar from '../../components/Calendar';
import AdminCalendar from '../../components/unauthorized';
;

const unauthorized = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <SidebarComp />

            <div className="flex-1">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="content p-4">
                    <AdminCalendar />
                </div>
            </div>
        </div>
    );
};

export default unauthorized;
