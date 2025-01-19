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
                            <Link to="/view-schedules">View My Schedule</Link> {/* Add link for View My Schedule */}
                        </MenuItem>
                        <MenuItem>
                            <Link to="/set-availability">Set My Availability</Link> {/* Add link for Set My Availability */}
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
                        <MenuItem> View Services </MenuItem>
                        <MenuItem> Add Services </MenuItem>
                        <MenuItem> View Calendar </MenuItem>
                        <MenuItem> View Staff </MenuItem>
                        <MenuItem> Add Staff </MenuItem>
                    </SubMenu>
                </Menu>
            </Sidebar>
        </div>
    );
};

export default SidebarComp;
