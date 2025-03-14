import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarComp from './components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

import ViewSchedule from './pages/schedule/ViewSchedule';
import Home from './pages/home/Home';
import AddStaff from './pages/staff/AddStaff';
import ViewStaff from './pages/staff/ViewStaff';
import AddServices from './pages/services/AddServices';
import ViewServicesComp from './components/ViewServicesComp';
import ViewServices from './pages/services/ViewServices';
import AdminViewCalendar from './pages/calendar/AdminViewCalendar';
import ViewStaffCalendar from './pages/staff/ViewStaffCalendar'
import ViewStaffAppoints from './pages/schedule/ViewAppointments'
import Login from './components/Login'
import Unauthorized from './pages/Unauthorized/unauthorizedPage';
import ViewClientele from './pages/Clientele/ViewClientele'
import AddClienteleForm from './pages/Clientele/AddClientele';
import AdminViewClientele from "./pages/Clientele/ViewAdminClientele"
import ViewCashier from './pages/staff/Cashier';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/view-schedules" element={<ViewSchedule />} />
        <Route path="/viewStaffAppointments" element={<ViewStaffAppoints />} />
        <Route path="/addStaff" element={<AddStaff />} />
        <Route path="/viewStaff" element={<ViewStaff />} />
        <Route path="/viewStaffCalendar" element={<ViewStaffCalendar />} />

        <Route path="/addServices" element={<AddServices />} />
        <Route path="/viewServices" element={<ViewServices />} />
        <Route path="/adminCalendar" element={<AdminViewCalendar />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/providerViewClientele" element={<ViewClientele />} />
        <Route path="/addClienteleForm" element={<AddClienteleForm />} />
        <Route path="/adminViewClientele" element={<AdminViewClientele />} />
        <Route path="/frontDeskCheckout" element={<ViewCashier />} />
        

      </Routes>

    </Router>
  );
};

export default App;
