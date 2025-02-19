import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { myLogo } from '../assets/images';
import './../styles/sidebar.css';
import { Link, useNavigate } from 'react-router-dom';

const SidebarComp = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleScheduleNavigation = () => {
        if (user?.role === "barber") {
            navigate("/viewStaffAppointments", { state: { staff: user } });
        } else {
            navigate("/viewStaffCalendar");
        }
    };

    const handleAvailabilityNavigation = () => {
        if (user?.role === "barber") {
            navigate("/view-schedules", { state: { staff: user } });
        } else {
            navigate("/viewStaff");
        }
    };

    const handleLogout = () => {
        // Remove the user item (and any other relevant items) from localStorage
        localStorage.removeItem("user");
        // If you have other items, for example:
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Role Checks
    const isBarber = user?.role === "barber";
    const isFrontDesk = user?.role === "frontdesk";
    const isAdmin = user?.role === "admin";

    // Front Desk specific permission checks for Schedule/Clientele
    const hasFrontDeskSchedulePermissions = user?.permissions?.includes("manage_appointments") &&
        user?.permissions?.includes("modify_working_hours");

    // Admin Panel permission checks for front desk users
    const canViewStaff = user?.permissions?.includes("manage_staff");
    const canViewServices = user?.permissions?.includes("manage_services");
    const canViewBusinessHours = user?.permissions?.includes("manage_businessHours");

    return (
        <div className='mainContainer'>
            <Sidebar className="sidebar">
                <img src={myLogo} alt="Logo" className="sidebar-logo" />
                <Menu>
                    <MenuItem>
                        <Link to="/">Home</Link>
                    </MenuItem>

                    {/* For Barbers or Front Desk users with Schedule permissions */}
                    {(isBarber || hasFrontDeskSchedulePermissions) && (
                        <>
                            <SubMenu label="Schedule">
                                <MenuItem onClick={handleScheduleNavigation}>
                                    View My Schedule
                                </MenuItem>
                                <MenuItem onClick={handleAvailabilityNavigation}>
                                    Set My Availability
                                </MenuItem>
                            </SubMenu>
                            <SubMenu label="Clientele">
                                <MenuItem> View Clients </MenuItem>
                                <MenuItem> Add a Client </MenuItem>
                            </SubMenu>
                        </>
                    )}

                    {/* Show Front Desk menu for Front Desk users and Admins */}
                    {(isFrontDesk || isAdmin) && (
                        <SubMenu label="Front Desk">
                            <MenuItem> View Schedules </MenuItem>
                            <MenuItem> Cashier </MenuItem>
                        </SubMenu>
                    )}

                    {/* Show Admin panel for Admins or Front Desk with at least one admin permission */}
                    {(isAdmin || (isFrontDesk && (canViewStaff || canViewServices || canViewBusinessHours))) && (
                        <SubMenu label="Admin">
                            {(isAdmin || canViewServices) && (
                                <MenuItem>
                                    <Link to="/viewServices">View Services</Link>
                                </MenuItem>
                            )}
                            {(isAdmin || canViewBusinessHours) && (
                                <MenuItem>
                                    <Link to="/adminCalendar">View Calendar</Link>
                                </MenuItem>
                            )}
                            {(isAdmin || canViewStaff) && (
                                <MenuItem>
                                    <Link to="/viewStaff">View Staff</Link>
                                </MenuItem>
                            )}
                        </SubMenu>
                    )}

                    {/* Logout Button */}
                    <MenuItem onClick={handleLogout}>
                        Logout
                    </MenuItem>
                </Menu>
            </Sidebar>
        </div>
    );
};

export default SidebarComp;
