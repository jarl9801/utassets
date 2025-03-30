// src/pages/InventoryForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './InventoryForm.css';

// Componentes de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const initialFormState = {
    itemName: '',
    itemCode: '',
    category: '',
    quantity: 1,
    condition: 'Bueno',
    location: '',
    acquisitionDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    responsiblePerson: '',
    notes: '',
    image: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('No se pudieron cargar las categorías');
      }
    };

    fetchCategories();

    // Si estamos editando, cargar los datos del item
    if (isEditing) {
      const fetchItemData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${API_URL}/inventory/${id}`);
          const item = response.data;
          
          setFormData({
            itemName: item.item_name,
            itemCode: item.item_code,
            category: item.category,
            quantity: item.quantity,
            condition: item.condition,
            location: item.location,
            acquisitionDate: item.acquisition_date ? item.acquisition_date.split('T')[0] : '',
            lastMaintenanceDate: item.last_maintenance_date ? item.last_maintenance_date.split('T')[0] : '',
            nextMaintenanceDate: item.next_maintenance_date ? item.next_maintenance_date.split('T')[0] : '',
            responsiblePerson: item.responsible_person,
            notes: item.notes || '',
            image: null
          });

          // Si hay una imagen, establecer la vista previa
          if (item.image_path) {
            setImagePreview(`${API_URL}${item.image_path}`);
          }
        } catch (error) {
          console.error('Error fetching item data:', error);
          toast.error('Error al cargar los datos del item');
          navigate('/inventory');
        } finally {
          setIsLoading(false);
        }
      };

      fetchItemData();
    }
  }, [id, isEditing, navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0]
      });
      
      // Crear URL para vista previa de la imagen
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'El nombre del item es requerido';
    }
    
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = 'El código del item es requerido';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser al menos 1';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    
    if (!formData.responsiblePerson.trim()) {
      newErrors.responsiblePerson = 'El responsable es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }
    
    setIsLoading(true);
    
    // Crear FormData para enviar archivos
    const data = new FormData();
    for (const key in formData) {
      if (key === 'image' && formData[key] === null) {
        continue;
      }
      data.append(key, formData[key]);
    }
    
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/inventory/${id}`, data);
        toast.success('Item actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/inventory`, data);
        toast.success('Item añadido correctamente');
      }
      
      navigate('/inventory');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'añadir'} el item`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="loading-spinner">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="inventory-form-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEditing ? 'Editar Item' : 'Añadir Nuevo Item'}
          </h2>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowBackIcon /> Volver
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="itemName">Nombre del Item*</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                className={`form-control ${errors.itemName ? 'error' : ''}`}
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Ej: Taladro Eléctrico"
              />
              {errors.itemName && <div className="error-message">{errors.itemName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="itemCode">Código*</label>
              <input
                type="text"
                id="itemCode"
                name="itemCode"
                className={`form-control ${errors.itemCode ? 'error' : ''}`}
                value={formData.itemCode}
                onChange={handleInputChange}
                placeholder="Ej: TOOL-001"
              />
              {errors.itemCode && <div className="error-message">{errors.itemCode}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría*</label>
              <select
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una categoría</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Equipo Electrónico">Equipo Electrónico</option>
                    <option value="Herramienta Manual">Herramienta Manual</option>
                    <option value="Maquinaria">Maquinaria</option>
                    <option value="Equipo de Seguridad">Equipo de Seguridad</option>
                    <option value="Equipo de Medición">Equipo de Medición</option>
                    <option value="Otro">Otro</option>
                  </>
                )}
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Cantidad*</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className={`form-control ${errors.quantity ? 'error' : ''}`}
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
              />
              {errors.quantity && <div className="error-message">{errors.quantity}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="condition">Estado*</label>
              <select
                id="condition"
                name="condition"
                className="form-control"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Necesita Reparación">Necesita Reparación</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Ubicación*</label>
              <input
                type="text"
                id="location"
                name="location"
                className={`form-control ${errors.location ? 'error' : ''}`}
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Almacén Principal"
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="acquisitionDate">Fecha de Adquisición</label>
              <input
                type="date"
                id="acquisitionDate"
                name="acquisitionDate"
                className="form-control"
                value={formData.acquisitionDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastMaintenanceDate">Último Mantenimiento</label>
              <input
                type="date"
                id="lastMaintenanceDate"
                name="lastMaintenanceDate"
                className="form-control"
                value={formData.lastMaintenanceDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nextMaintenanceDate">Próximo Mantenimiento</label>
              <input
                type="date"
                id="nextMaintenanceDate"
                name="nextMaintenanceDate"
                className="form-control"
                value={formData.nextMaintenanceDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsiblePerson">Responsable*</label>
              <input
                type="text"
                id="responsiblePerson"
                name="responsiblePerson"
                className={`form-control ${errors.responsiblePerson ? 'error' : ''}`}
                value={formData.responsiblePerson}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
              />
              {errors.responsiblePerson && (
                <div className="error-message">{errors.responsiblePerson}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Información adicional relevante"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group image-upload-group">
              <label htmlFor="image">Imagen del Item</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-control"
                accept="image/*"
                onChange={handleInputChange}
              />
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Vista previa" className="image-preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              <SaveIcon /> {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/inventory')}
              disabled={isLoading}
            >
              <CancelIcon /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;