import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { myLogo } from '../assets/images';
import './../styles/sidebar.css';
import { Link, useNavigate } from 'react-router-dom';

const SidebarComp = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleScheduleNavigation = async () => {
    try {
      // Fetch the latest schedule (working hours) for the staff member
      const response = await fetch(`http://localhost:8080/api/staff/schedule/${user._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch working hours");
      }
      const schedule = await response.json();
      const workingHours = schedule.schedule;
  
      // Update the user object with the fetched working hours
      const updatedUser = { ...user, workingHours };
      console.log("THIS IS THE UPDATED USER", updatedUser);
  
      // Navigate for providers
      if (updatedUser.role === "provider") {
        navigate("/viewStaffAppointments", { state: { staff: updatedUser } });
      }
    } catch (error) {
      console.error("Error fetching working hours:", error);
      if (user?.role === "provider") {
        navigate("/viewStaffAppointments", { state: { staff: user } });
      }
    }
  };

  const handleAvailabilityNavigation = () => {
    if (user?.role === "provider") {
      navigate("/view-schedules", { state: { staff: user } });
    } else {
      navigate("/viewStaff");
    }
  };

  const handleLogout = () => {
    // Remove user and token from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Role Checks
  const isprovider = user?.role === "provider";
  const isFrontDesk = user?.role === "frontdesk";
  const isAdmin = user?.role === "admin";

  // For frontdesk, check if they have the manage_clientele permission
  const hasManageClientele = user?.permissions?.includes("manage_clientele");

  return (
    <div className='mainContainer'>
      <Sidebar className="sidebar">
        <img src={myLogo} alt="Logo" className="sidebar-logo" />
        <Menu>
          <MenuItem>
            <Link to="/">Home</Link>
          </MenuItem>

          {/* Show Schedule submenu only for providers */}
          {isprovider && (
            <SubMenu label="Schedule">
              <MenuItem onClick={handleScheduleNavigation}>
                View My Schedule
              </MenuItem>
              <MenuItem onClick={handleAvailabilityNavigation}>
                Set My Availability
              </MenuItem>
            </SubMenu>
          )}

          {/* Show Clientele submenu */}
          {(isprovider || hasManageClientele) && (
            <SubMenu label="Clientele">
              {isprovider ? (
                <MenuItem>
                  <Link to="/providerViewClientele">View Clientele</Link>
                </MenuItem>
              ) : (
                <MenuItem>
                  <Link to="/adminViewClientele">View Clientele</Link>
                </MenuItem>
              )}
            </SubMenu>
          )}

          {/* Front Desk submenu for non-provider frontdesk users */}
          {isFrontDesk && !isprovider && (
            <SubMenu label="Front Desk">
              <MenuItem>
                <Link to="/viewStaffCalendar">View Schedules</Link>
              </MenuItem>
              <MenuItem>Cashier</MenuItem>
            </SubMenu>
          )}

          {/* Show Admin panel for Admins or Front Desk with admin permissions */}
          {(isAdmin || (isFrontDesk && (
            user?.permissions?.includes("manage_staff") ||
            user?.permissions?.includes("manage_services") ||
            user?.permissions?.includes("manage_businessHours")
          ))) && (
            <SubMenu label="Admin">
              {(isAdmin || user?.permissions?.includes("manage_services")) && (
                <MenuItem>
                  <Link to="/viewServices">View Services</Link>
                </MenuItem>
              )}
              {(isAdmin || user?.permissions?.includes("manage_businessHours")) && (
                <MenuItem>
                  <Link to="/adminCalendar">View Calendar</Link>
                </MenuItem>
              )}
              {(isAdmin || user?.permissions?.includes("manage_staff")) && (
                <MenuItem>
                  <Link to="/viewStaff">View Staff</Link>
                </MenuItem>
              )}
            </SubMenu>
          )}

          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidebarComp;
