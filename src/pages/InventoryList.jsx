// src/pages/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './InventoryList.css';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InventoryList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCondition, setSelectedCondition] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const [inventoryResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}/inventory`),
        axios.get(`${API_URL}/categories`)
      ]);
      
      setItems(inventoryResponse.data);
      setFilteredItems(inventoryResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filtrar y ordenar items
    let result = [...items];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.item_name.toLowerCase().includes(term) ||
        item.item_code.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.responsible_person.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de categoría
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Aplicar filtro de condición
    if (selectedCondition) {
      result = result.filter(item => item.condition === selectedCondition);
    }
    
    // Aplicar ordenamiento
    if (sortField) {
      result.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];
        
        // Convertir a minúsculas si son strings
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        if (valueA < valueB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, categoryFilter, sortField, sortDirection, selectedCondition]);

  const handleDelete = async (id, itemName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${itemName}"?`)) {
      try {
        await axios.delete(`${API_URL}/inventory/${id}`);
        toast.success('Item eliminado correctamente');
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Error al eliminar el item');
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo de ordenamiento
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSelectedCondition('');
    setSortField('');
    setSortDirection('asc');
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

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <p>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="inventory-list-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Inventario de Equipos y Herramientas</h2>
          <Link to="/inventory/new" className="btn btn-primary">
            <AddIcon /> Añadir Item
          </Link>
        </div>

        <div className="filter-controls">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por nombre, código, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <FilterListIcon />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <FilterListIcon />
              <select 
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Necesita Reparación">Necesita Reparación</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>
            
            <button 
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No se encontraron items con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('item_code')}>
                    Código
                    {sortField === 'item_code' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('item_name')}>
                    Nombre
                    {sortField === 'item_name' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('category')}>
                    Categoría
                    {sortField === 'category' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('quantity')}>
                    Cantidad
                    {sortField === 'quantity' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('condition')}>
                    Estado
                    {sortField === 'condition' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('location')}>
                    Ubicación
                    {sortField === 'location' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th className="sortable" onClick={() => handleSort('responsible_person')}>
                    Responsable
                    {sortField === 'responsible_person' && (
                      <SortIcon className={`sort-icon ${sortDirection}`} />
                    )}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_code}</td>
                    <td className="item-name">{item.item_name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.condition)}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>{item.responsible_person}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => navigate(`/inventory/edit/${item.id}`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => handleDelete(item.id, item.item_name)}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                        <button 
                          className="btn-action maintain"
                          onClick={() => navigate(`/maintenance/${item.id}`)}
                          title="Historial de mantenimiento"
                        >
                          <BuildIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;