import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/register-vehicle.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function RegisterVehicle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    capacity: ''
  });
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [soatPhoto, setSoatPhoto] = useState(null);
  const [vehiclePhotoName, setVehiclePhotoName] = useState('No file chosen');
  const [soatPhotoName, setSoatPhotoName] = useState('No file chosen');
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleCapacityClick = (capacity) => {
    setSelectedCapacity(capacity);
    setFormData(prev => ({
      ...prev,
      capacity: capacity.toString()
    }));
    setError('');
  };

  const handleVehiclePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVehiclePhoto(e.target.files[0]);
      setVehiclePhotoName(e.target.files[0].name);
    } else {
      setVehiclePhoto(null);
      setVehiclePhotoName('No file chosen');
    }
    setError('');
  };

  const handleSoatPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSoatPhoto(e.target.files[0]);
      setSoatPhotoName(e.target.files[0].name);
    } else {
      setSoatPhoto(null);
      setSoatPhotoName('No file chosen');
    }
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateVehicleForm = (data) => {
    if (!data.licensePlate || data.licensePlate.trim().length < 5) {
      setError('Please enter a valid license plate');
      return false;
    }
    if (!data.make || !data.make.trim()) {
      setError('Please enter a vehicle make');
      return false;
    }
    if (!data.model || !data.model.trim()) {
      setError('Please enter a vehicle model');
      return false;
    }
    if (!data.capacity || data.capacity === '') {
      setError('Please select vehicle capacity');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const vehicleData = {
      licensePlate: formData.licensePlate.trim().toUpperCase(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      capacity: parseInt(formData.capacity),
      vehiclePhoto: vehiclePhoto,
      soatPhoto: soatPhoto
    };

    if (!validateVehicleForm(vehicleData)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('placa', vehicleData.licensePlate);
      formDataToSend.append('marca', vehicleData.make);
      formDataToSend.append('modelo', vehicleData.model);
      formDataToSend.append('capacidad', vehicleData.capacity);
      if (vehiclePhoto) formDataToSend.append('fotoVehiculo', vehiclePhoto);
      if (soatPhoto) formDataToSend.append('fotoSOAT', soatPhoto);

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar vehículo');
      }

      console.log('✅ Vehículo registrado exitosamente:', result);

      // Obtener el usuario actualizado del backend
      try {
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data.user) {
            const updatedUser = userData.data.user;

            // Actualizar el objeto user completo en localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Actualizar también los campos individuales
            localStorage.setItem('userRole', updatedUser.rol);
            sessionStorage.setItem('userRole', updatedUser.rol);

            console.log('✅ Usuario actualizado:', {
              rol: updatedUser.rol,
              conductorRegistrado: updatedUser.conductorRegistrado
            });
          }
        }
      } catch (err) {
        console.warn('No se pudo actualizar el usuario:', err);

        // Si falla, actualizar manualmente el objeto user en localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          user.conductorRegistrado = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      // Actualizar datos de sesión
      const userRole = localStorage.getItem('userRole') || 'conductor';
      sessionStorage.setItem('userRole', userRole);
      sessionStorage.setItem('isLoggedIn', 'true');

      // Redirigir al dashboard de conductor en React
      setTimeout(() => {
        navigate('/dashboard/driver', { replace: true });
      }, 500);

    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item">Role</div>
        <div className="sidebar-item" onClick={() => navigate('/login')}>Sign In</div>
        <div className="sidebar-item" onClick={() => navigate('/register')}>Sign Up</div>
        <div className="sidebar-item active">Vehicle Details</div>
      </div>

      {/* Main Content */}
      <div className="register-content">
        <div className="register-card">
          <div className="logo-header">
            <h1 className="logo">WHEELS <span className="car-icon">🚗</span></h1>
          </div>

          <h2 className="register-title">Vehicle Details</h2>

          {/* Vehicle Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="licensePlate">License Plate Number</label>
                <input 
                  type="text" 
                  id="licensePlate" 
                  name="licensePlate" 
                  placeholder="ABC123"
                  className="input-field"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="make">Vehicle Make</label>
                <input 
                  type="text" 
                  id="make" 
                  name="make" 
                  placeholder="Toyota"
                  className="input-field"
                  value={formData.make}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="vehiclePhoto">Upload Vehicle Photo</label>
              <input 
                type="file" 
                id="vehiclePhoto" 
                name="vehiclePhoto" 
                accept="image/*"
                className="input-field file-input"
                onChange={handleVehiclePhotoChange}
              />
              <span 
                className={`file-name ${vehiclePhoto ? 'has-file' : ''}`}
                onClick={() => document.getElementById('vehiclePhoto').click()}
              >
                {vehiclePhotoName}
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="model">Vehicle Model</label>
                <input 
                  type="text" 
                  id="model" 
                  name="model" 
                  placeholder="Corolla 2024"
                  className="input-field"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Capacity</label>
                <div className="capacity-buttons">
                  {[1, 2, 3, 4, 5].map((capacity) => (
                    <button
                      key={capacity}
                      type="button"
                      className={`capacity-btn ${selectedCapacity === capacity ? 'active' : ''}`}
                      onClick={() => handleCapacityClick(capacity)}
                    >
                      {capacity}
                    </button>
                  ))}
                </div>
                <input type="hidden" id="capacity" name="capacity" value={formData.capacity} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="soatPhoto">Upload SOAT Photo</label>
              <input 
                type="file" 
                id="soatPhoto" 
                name="soatPhoto" 
                accept="image/*"
                className="input-field file-input"
                onChange={handleSoatPhotoChange}
              />
              <span 
                className={`file-name ${soatPhoto ? 'has-file' : ''}`}
                onClick={() => document.getElementById('soatPhoto').click()}
              >
                {soatPhotoName}
              </span>
            </div>

            <button type="submit" className="btn-next" disabled={loading}>
              {loading ? 'Processing...' : 'OK ✓'}
            </button>
          </form>

          {error && (
            <div className="error-box" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterVehicle;

