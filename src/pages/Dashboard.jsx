// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Iconos de Material UI
import InventoryIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    maintenanceNeeded: 0,
    itemsByCategory: [],
    itemsByCondition: [],
    itemsByLocation: [],
    recentItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // En un entorno real, tendríamos un endpoint específico para estadísticas
        // Aquí simularemos procesando los datos del inventario
        const response = await axios.get(`${API_URL}/inventory`);
        const items = response.data;
        
        // Procesar datos para estadísticas
        const totalItems = items.length;
        
        // Obtener categorías únicas
        const categories = [...new Set(items.map(item => item.category))];
        const totalCategories = categories.length;
        
        // Items que necesitan mantenimiento
        const maintenanceNeeded = items.filter(item => 
          item.condition === 'Necesita Reparación' || 
          item.condition === 'Fuera de Servicio'
        ).length;
        
        // Agrupar por categoría
        const itemsByCategory = categories.map(category => {
          const count = items.filter(item => item.category === category).length;
          return { category, count };
        }).sort((a, b) => b.count - a.count);
        
        // Agrupar por condición
        const conditions = ['Excelente', 'Bueno', 'Regular', 'Necesita Reparación', 'Fuera de Servicio'];
        const itemsByCondition = conditions.map(condition => {
          const count = items.filter(item => item.condition === condition).length;
          return { condition, count };
        });
        
        // Agrupar por ubicación
        const locations = [...new Set(items.map(item => item.location))];
        const itemsByLocation = locations.map(location => {
          const count = items.filter(item => item.location === location).length;
          return { location, count };
        }).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 ubicaciones
        
        // Items más recientes (basados en la fecha de creación)
        const recentItems = [...items]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        setStats({
          totalItems,
          totalCategories,
          maintenanceNeeded,
          itemsByCategory,
          itemsByCondition,
          itemsByLocation,
          recentItems
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">
        <span className="panda-logo">🐼</span> 
        Dashboard Panda Assets
      </h1>
      
      <div className="dashboard-grid">
        {/* Tarjetas de resumen */}
        <div className="summary-card total-items">
          <div className="summary-icon">
            <InventoryIcon />
          </div>
          <div className="summary-content">
            <h3>Total Items</h3>
            <p className="summary-value">{stats.totalItems}</p>
          </div>
        </div>
        
        <div className="summary-card total-categories">
          <div className="summary-icon">
            <CategoryIcon />
          </div>
          <div className="summary-content">
            <h3>Categorías</h3>
            <p className="summary-value">{stats.totalCategories}</p>
          </div>
        </div>
        
        <div className="summary-card maintenance-needed">
          <div className="summary-icon">
            <BuildIcon />
          </div>
          <div className="summary-content">
            <h3>Necesitan Mantenimiento</h3>
            <p className="summary-value">{stats.maintenanceNeeded}</p>
          </div>
        </div>
        
        <div className="summary-card info-card">
          <div className="summary-icon">
            <InfoIcon />
          </div>
          <div className="summary-content">
            <h3>Alerta de Inventario</h3>
            {stats.maintenanceNeeded > 0 ? (
              <p className="alert-message">
                <WarningIcon /> {stats.maintenanceNeeded} items requieren atención
              </p>
            ) : (
              <p className="normal-message">Todos los items están en buen estado</p>
            )}
          </div>
        </div>
        
        {/* Distribución por categoría */}
        <div className="dashboard-card category-distribution">
          <div className="card-header">
            <h3>
              <CategoryIcon /> Distribución por Categoría
            </h3>
          </div>
          <div className="card-content">
            <div className="distribution-bars">
              {stats.itemsByCategory.map((cat, index) => (
                <div className="bar-item" key={index}>
                  <div className="bar-label">{cat.category}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${(cat.count / stats.totalItems) * 100}%`,
                        backgroundColor: getBarColor(index)
                      }}
                    ></div>
                    <span className="bar-value">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Estado de equipos */}
        <div className="dashboard-card condition-stats">
          <div className="card-header">
            <h3>
              <BuildIcon /> Estado de Equipos
            </h3>
          </div>
          <div className="card-content">
            <div className="condition-chart">
              {stats.itemsByCondition.map((condition, index) => (
                <div 
                  key={index} 
                  className="condition-segment"
                  style={{ 
                    width: `${(condition.count / stats.totalItems) * 100}%`,
                    backgroundColor: getConditionColor(condition.condition)
                  }}
                  title={`${condition.condition}: ${condition.count} items`}
                >
                </div>
              ))}
            </div>
            <div className="condition-legend">
              {stats.itemsByCondition.map((condition, index) => (
                <div key={index} className="legend-item">
                  <span 
                    className="legend-color" 
                    style={{ backgroundColor: getConditionColor(condition.condition) }}
                  ></span>
                  <span className="legend-label">{condition.condition}</span>
                  <span className="legend-value">{condition.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Top ubicaciones */}
        <div className="dashboard-card locations-card">
          <div className="card-header">
            <h3>
              <LocationOnIcon /> Top Ubicaciones
            </h3>
          </div>
          <div className="card-content">
            <ul className="locations-list">
              {stats.itemsByLocation.map((loc, index) => (
                <li key={index} className="location-item">
                  <span className="location-name">{loc.location}</span>
                  <span className="location-count">{loc.count} items</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Items recientes */}
        <div className="dashboard-card recent-items">
          <div className="card-header">
            <h3>
              <TrendingUpIcon /> Items Recientes
            </h3>
            <Link to="/inventory" className="view-all-link">
              Ver todos
            </Link>
          </div>
          <div className="card-content">
            <table className="recent-items-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.condition)}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Acciones rápidas */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>
              <AssignmentIcon /> Acciones Rápidas
            </h3>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <Link to="/inventory/new" className="quick-action-button">
                <InventoryIcon />
                <span>Añadir Item</span>
              </Link>
              <Link to="/inventory" className="quick-action-button">
                <BuildIcon />
                <span>Ver Inventario</span>
              </Link>
              <Link to="/project-assignment" className="quick-action-button">
                <AssignmentIcon />
                <span>Asignar a Proyecto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para colores
const getBarColor = (index) => {
  const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'];
  return colors[index % colors.length];
};

const getConditionColor = (condition) => {
  switch (condition) {
    case 'Excelente': return '#4caf50';
    case 'Bueno': return '#2196f3';
    case 'Regular': return '#ff9800';
    case 'Necesita Reparación': return '#f44336';
    case 'Fuera de Servicio': return '#9e9e9e';
    default: return '#9e9e9e';
  }
};

const getStatusClass = (condition) => {
  switch (condition) {
    case 'Excelente': return 'excelente';
    case 'Bueno': return 'bueno';
    case 'Regular': return 'regular';
    case 'Necesita Reparación': return 'necesita-reparacion';
    case 'Fuera de Servicio': return 'fuera-de-servicio';
    default: return '';
  }
};

export default Dashboard;