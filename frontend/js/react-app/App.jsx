import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardRider from './pages/DashboardRider.jsx';
import DashboardDriver from './pages/DashboardDriver.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/rider" replace />} />
        <Route path="/dashboard/rider" element={<DashboardRider />} />
        <Route path="/dashboard/driver" element={<DashboardDriver />} />
      </Routes>
    </Router>
  );
}

export default App;