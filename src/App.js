// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';
import MaintenanceHistory from './pages/MaintenanceHistory';
import ProjectAssignment from './pages/ProjectAssignment';
import NotFound from './pages/NotFound';

// Estilos
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/new" element={<InventoryForm />} />
            <Route path="/inventory/edit/:id" element={<InventoryForm />} />
            <Route path="/maintenance/:id" element={<MaintenanceHistory />} />
            <Route path="/project-assignment" element={<ProjectAssignment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;