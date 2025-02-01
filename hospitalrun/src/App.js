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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view-schedules" element={<ViewSchedule />} />
        <Route path="/addStaff" element={<AddStaff />} />
        <Route path="/viewStaff" element={<ViewStaff />} />
        <Route path="/addServices" element={<AddServices />} />
        <Route path="/viewServices" element={<ViewServices />} />
        <Route path="/adminCalendar" element={<AdminViewCalendar />} />
      </Routes>

    </Router>
  );
};

export default App;
