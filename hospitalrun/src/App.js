import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarComp from './components/Sidebar';

import ViewSchedule from './pages/schedule/ViewSchedule';
import Home from './pages/home/Home';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view-schedules" element={<ViewSchedule />} />
      </Routes>

    </Router>
  );
};

export default App;
