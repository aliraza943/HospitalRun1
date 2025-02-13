import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { myLogo } from '../assets/images';
import './../styles/sidebar.css'
import { Link } from 'react-router-dom';
const SidebarComp = () => {
    return (
        <div className='mainContainer' >
            <Sidebar
                className="sidebar"
            >
                <img
                    src={myLogo}
                    alt="Logo"
                    className="sidebar-logo"
                />
                <Menu  >
                    <MenuItem>
                        <Link to="/">Home</Link>
                    </MenuItem>
                    <SubMenu label="Schedule">
                        <MenuItem>
                            <Link to="/viewStaffCalendar">View My Schedule</Link>
                        </MenuItem>
                        <MenuItem>
                            <Link to="/viewStaff">Set My Availability</Link>

                        </MenuItem>
                    </SubMenu>
                    <SubMenu label="Clientele">
                        <MenuItem> View Clients </MenuItem>
                        <MenuItem> Add a Client </MenuItem>
                    </SubMenu>
                    <SubMenu label="Front Desk">
                        <MenuItem> View Schedules </MenuItem>
                        <MenuItem> Cashier </MenuItem>
                    </SubMenu>
                    <SubMenu label="Admin">
                        <MenuItem>  <Link to="/viewServices">View Services</Link></MenuItem>
                        {/* <MenuItem>  <Link to="/addServices">Add Services</Link></MenuItem> */}
                        <MenuItem>  <Link to="/adminCalendar"> View Calendar </Link> </MenuItem>
                        <MenuItem>  <Link to="/viewStaff"> View Staff </Link> </MenuItem>

                        {/* <MenuItem>  <Link to="/addStaff">Add Staff</Link> </MenuItem> */}

                    </SubMenu>
                </Menu>
            </Sidebar>
        </div>
    );
};

export default SidebarComp;
