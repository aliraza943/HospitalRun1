import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { myLogo } from '../assets/images';
import './../styles/sidebar.css';
import { Link, useNavigate } from 'react-router-dom';

const SidebarComp = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user,"LOL")
  const [activeSubmenu, setActiveSubmenu] = useState(localStorage.getItem("activeSubmenu") || null);

  useEffect(() => {
    localStorage.setItem("activeSubmenu", activeSubmenu);
  }, [activeSubmenu]);

  const toggleSubMenu = (menu) => {
    // If the clicked menu is already active, close it
    // Otherwise set it as the active menu (closing any other open menu)
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const handleScheduleNavigation = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/staff/schedule/${user._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch working hours");
      }
      const schedule = await response.json();
      const workingHours = schedule.schedule;
      const updatedUser = { ...user, workingHours };
      console.log("THIS IS THE UPDATED USER", updatedUser);
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
      // navigate("/view-schedules", { state: { staff: user } });
    } else {
      navigate("/viewStaff");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("activeSubmenu"); // Also clear the active submenu on logout
    navigate("/login");
  };

  const isprovider = user?.role === "provider";
  const isFrontDesk = user?.role === "frontdesk";
  const isAdmin = user?.role === "admin";
  const hasManageClientele = user?.permissions?.includes("manage_clientele");

  return (
    <div className='mainContainer'>
      <Sidebar className="sidebar">
        <img src={myLogo} alt="Logo" className="sidebar-logo" />
        <Menu>
          <MenuItem>
            <Link to="/">Home</Link>
          </MenuItem>
          {isprovider && (
            <SubMenu
              label="Schedule"
              open={activeSubmenu === 'Schedule'}
              onOpenChange={() => toggleSubMenu('Schedule')}
            >
              <MenuItem onClick={handleScheduleNavigation}>View My Schedule</MenuItem>
              <MenuItem onClick={handleAvailabilityNavigation}>Set My Availability</MenuItem>
            </SubMenu>
          )}
          {(isprovider || hasManageClientele) && (
            <SubMenu
              label="Clientele"
              open={activeSubmenu === 'Clientele'}
              onOpenChange={() => toggleSubMenu('Clientele')}
            >
              {isprovider ? (
                <MenuItem><Link to="/providerViewClientele">View Clientele</Link></MenuItem>
              ) : (
                <MenuItem><Link to="/adminViewClientele">View Clientele</Link></MenuItem>
              )}
            </SubMenu>
          )}
          {isFrontDesk && !isprovider && (
            <SubMenu
              label="Front Desk"
              open={activeSubmenu === 'Front Desk'}
              onOpenChange={() => toggleSubMenu('Front Desk')}
            >
              <MenuItem><Link to="/viewStaffCalendar">View Schedules</Link></MenuItem>
              <MenuItem><Link to="/frontDeskCheckout">Checkout</Link></MenuItem>
            </SubMenu>
          )}
          {(isAdmin || (isFrontDesk && (
            user?.permissions?.includes("manage_staff") ||
            user?.permissions?.includes("manage_services") ||
            user?.permissions?.includes("manage_businessHours")
          ))) && (
              <SubMenu
                label="Admin"
                open={activeSubmenu === 'Admin'}
                onOpenChange={() => toggleSubMenu('Admin')}
              >
                {(isAdmin || user?.permissions?.includes("manage_services")) && (
                  <MenuItem><Link to="/viewServices">View Services</Link></MenuItem>
                )}
                {(isAdmin || user?.permissions?.includes("manage_businessHours")) && (
                  <MenuItem><Link to="/adminCalendar">View Calendar</Link></MenuItem>
                )}
                {(isAdmin || user?.permissions?.includes("manage_staff")) && (
                  <MenuItem><Link to="/viewStaff">View Staff</Link></MenuItem>
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