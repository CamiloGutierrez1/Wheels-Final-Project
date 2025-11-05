import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function DashboardDriver() {
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    ruta: '',
    hora: '',
    asientosDisponibles: '',
    precio: ''
  });
  
  const [rutaPoints, setRutaPoints] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [myTrips, setMyTrips] = useState([]);
  const [showTrips, setShowTrips] = useState(false);
  const [selectedTripForBookings, setSelectedTripForBookings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    checkAuth();
    loadUserInfo();
    loadMyTrips();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  };

  const loadUserInfo = () => {
    const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';
    const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || 'conductor';
    
    setUserInfo({
      name: userName,
      role: userRole
    });
  };

  const loadMyTrips = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/trips/my-trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMyTrips(data.data.trips || []);
      }
    } catch (err) {
      console.error('Error cargando mis viajes:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleRutaPointChange = (index, value) => {
    const newRutaPoints = [...rutaPoints];
    newRutaPoints[index] = value;
    setRutaPoints(newRutaPoints);
  };

  const addRutaPoint = () => {
    setRutaPoints([...rutaPoints, '']);
  };

  const removeRutaPoint = (index) => {
    if (rutaPoints.length > 1) {
      const newRutaPoints = rutaPoints.filter((_, i) => i !== index);
      setRutaPoints(newRutaPoints);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validar que todos los campos estén llenos
    if (!formData.origen || !formData.destino || !formData.hora || 
        !formData.asientosDisponibles || !formData.precio) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    // Validar ruta (debe tener al menos origen y destino)
    const validRutaPoints = rutaPoints.filter(p => p.trim() !== '');
    if (validRutaPoints.length < 2) {
      setError('La ruta debe tener al menos 2 puntos (origen y destino)');
      setLoading(false);
      return;
    }

    // Validar asientos (1-5)
    const asientos = parseInt(formData.asientosDisponibles);
    if (asientos < 1 || asientos > 5) {
      setError('La cantidad de asientos debe estar entre 1 y 5');
      setLoading(false);
      return;
    }

    // Validar precio
    const precio = parseFloat(formData.precio);
    if (precio <= 0) {
      setError('El precio debe ser mayor a 0');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      
      // Construir la ruta completa: origen + puntos intermedios + destino
      const rutaCompleta = [
        formData.origen,
        ...validRutaPoints.slice(1, -1), // Puntos intermedios (excluyendo origen y destino si están duplicados)
        formData.destino
      ];
      
      // Si el primer punto de ruta es diferente al origen, usarlo
      if (validRutaPoints[0] && validRutaPoints[0] !== formData.origen) {
        rutaCompleta[0] = validRutaPoints[0];
      }

      const tripData = {
        origen: formData.origen,
        destino: formData.destino,
        ruta: rutaCompleta,
        hora: formData.hora,
        asientosDisponibles: asientos,
        asientosTotales: asientos,
        precio: precio,
        estado: 'activo'
      };

      const response = await fetch(`${API_BASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tripData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('¡Viaje creado exitosamente!');
        // Limpiar formulario
        setFormData({
          origen: '',
          destino: '',
          ruta: '',
          hora: '',
          asientosDisponibles: '',
          precio: ''
        });
        setRutaPoints(['']);
        // Recargar mis viajes
        loadMyTrips();
        
        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || 'Error al crear el viaje');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('token');
      sessionStorage.clear();
      // Desde dashboard.html que está en pages/shared/, login.html está en el mismo directorio
      window.location.href = 'login.html';
    }
  };

  const handleSwitchToRider = () => {
    // Cambiar al modo pasajero
    window.location.href = 'dashboard.html#/dashboard/rider';
  };

  const handleGoToProfile = () => {
    // Salir de React y navegar a la página HTML estática
    // Desde dashboard.html en pages/shared/, profile-view.html está en el mismo directorio
    window.location.href = window.location.origin + '/pages/shared/profile-view.html';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  const formatRoute = (ruta) => {
    if (Array.isArray(ruta)) {
      return ruta.join(' → ');
    }
    return ruta || 'N/A';
  };

  // Cargar reservas de un viaje específico
  const loadBookingsForTrip = async (tripId) => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/bookings/trip/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(data.data.bookings || []);
        setSelectedTripForBookings(tripId);
      } else {
        setError(data.message || 'Error al cargar reservas');
        setBookings([]);
      }
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError('Error al cargar reservas');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Confirmar una reserva
  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Reserva confirmada exitosamente');
        // Recargar reservas
        if (selectedTripForBookings) {
          loadBookingsForTrip(selectedTripForBookings);
        }
        // Recargar mis viajes para actualizar cupos
        loadMyTrips();
      } else {
        alert(data.message || 'Error al confirmar reserva');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al confirmar reserva');
    }
  };

  // Cerrar modal de reservas
  const handleCloseBookingsModal = () => {
    setSelectedTripForBookings(null);
    setBookings([]);
  };

  return (
    <div className="dashboard-rider">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-header">
            <h1 className="logo-title">WHEELS <span className="car-icon">🚗</span></h1>
          </div>
          <div className="user-info">
            <span className="user-name" onClick={handleGoToProfile} style={{ cursor: 'pointer' }}>
              {userInfo?.name || 'Usuario'}
            </span>
            <button className="btn-conductor" onClick={handleSwitchToRider}>
              Volver a Pasajero
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Formulario de Crear Viaje */}
        <section className="filters-section">
          <div className="filters-container">
            <h2 className="section-title">Crear Nuevo Viaje</h2>
            
            {error && (
              <div className="error-box" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div className="error-box" style={{ 
                marginBottom: '20px', 
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' 
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-trip-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="origen">Punto de Inicio *</label>
                  <input
                    type="text"
                    id="origen"
                    name="origen"
                    className="input-field"
                    placeholder="Ej: Universidad Nacional"
                    value={formData.origen}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="destino">Punto Final *</label>
                  <input
                    type="text"
                    id="destino"
                    name="destino"
                    className="input-field"
                    placeholder="Ej: Centro Comercial"
                    value={formData.destino}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ruta">Ruta (Puntos Intermedios)</label>
                <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '10px' }}>
                  Agrega los puntos intermedios de la ruta. El primer punto será el origen y el último el destino.
                </p>
                {rutaPoints.map((point, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`Punto ${index + 1}${index === 0 ? ' (Origen)' : index === rutaPoints.length - 1 ? ' (Destino)' : ''}`}
                      value={point}
                      onChange={(e) => handleRutaPointChange(index, e.target.value)}
                    />
                    {rutaPoints.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeRutaPoint(index)}
                        style={{
                          padding: '10px 20px',
                          background: '#ff3b3b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRutaPoint}
                  className="btn-add-point"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginTop: '10px'
                  }}
                >
                  + Agregar Punto Intermedio
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hora">Hora de Salida *</label>
                  <input
                    type="time"
                    id="hora"
                    name="hora"
                    className="input-field"
                    value={formData.hora}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asientosDisponibles">Cantidad de Puestos Disponibles *</label>
                  <input
                    type="number"
                    id="asientosDisponibles"
                    name="asientosDisponibles"
                    className="input-field"
                    placeholder="1-5"
                    min="1"
                    max="5"
                    value={formData.asientosDisponibles}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="precio">Tarifa por Pasajero *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  className="input-field"
                  placeholder="Ej: 15000"
                  min="0"
                  step="100"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />
                <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginTop: '5px' }}>
                  Precio en pesos colombianos
                </p>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-confirm" disabled={loading}>
                  {loading ? 'Creando Viaje...' : 'Crear Viaje'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Mis Viajes Creados */}
        <section className="trips-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title">Mis Viajes Creados</h2>
            <button
              className="btn-search"
              onClick={() => setShowTrips(!showTrips)}
              style={{ padding: '10px 20px' }}
            >
              {showTrips ? 'Ocultar' : 'Mostrar'} Viajes
            </button>
          </div>

          {showTrips && (
            <>
              {myTrips.length === 0 ? (
                <div className="empty-state">
                  <p>No has creado ningún viaje aún</p>
                </div>
              ) : (
                <div className="trips-container">
                  {myTrips.map(trip => (
                    <div key={trip._id} className="trip-card">
                      <span className={`status-badge ${trip.estado === 'activo' ? 'available' : 'full'}`}>
                        {trip.estado?.toUpperCase() || 'ACTIVO'}
                      </span>
                      
                      <div className="trip-details">
                        <div className="detail-row">
                          <span className="detail-label">Punto inicio:</span>
                          <span className="detail-value">{trip.origen}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Punto final:</span>
                          <span className="detail-value">{trip.destino}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Ruta:</span>
                          <span className="detail-value">{formatRoute(trip.ruta)}</span>
                        </div>
                        <div className="route-display">
                          {Array.isArray(trip.ruta) ? trip.ruta.map((punto, idx) => (
                            <div key={idx}>{idx + 1}. {punto}</div>
                          )) : trip.ruta}
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Hora de salida:</span>
                          <span className="detail-value">{trip.hora}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cupos disponibles:</span>
                          <span className="detail-value">{trip.asientosDisponibles} / {trip.asientosTotales}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Tarifa por pasajero:</span>
                          <span className="detail-value">${formatPrice(trip.precio)}</span>
                        </div>
                      </div>

                      {/* Botón para ver reservas */}
                      <button
                        className="btn-search"
                        onClick={() => loadBookingsForTrip(trip._id)}
                        style={{ marginTop: '15px', width: '100%' }}
                      >
                        Ver Reservas ({trip.reservas?.length || 0})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Modal de Reservas */}
      {selectedTripForBookings && (
        <div className="modal" onClick={handleCloseBookingsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Reservas del Viaje</h2>
              <button className="modal-close" onClick={handleCloseBookingsModal}>&times;</button>
            </div>

            <div className="modal-body">
              {loadingBookings ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Cargando reservas...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <p>No hay reservas para este viaje aún</p>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {bookings.map((booking) => (
                    <div key={booking._id} className="trip-card" style={{ marginBottom: '15px' }}>
                      <span className={`status-badge ${
                        booking.estado === 'confirmada' ? 'available' :
                        booking.estado === 'pendiente' ? 'warning' : 'full'
                      }`}>
                        {booking.estado.toUpperCase()}
                      </span>

                      <div className="trip-details">
                        <div className="detail-row">
                          <span className="detail-label">Pasajero:</span>
                          <span className="detail-value">
                            {booking.pasajero?.nombre} {booking.pasajero?.apellido}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Teléfono:</span>
                          <span className="detail-value">{booking.pasajero?.telefono}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cupos reservados:</span>
                          <span className="detail-value">{booking.cuposReservados}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Punto de recogida:</span>
                          <span className="detail-value">{booking.puntoRecogida}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total a pagar:</span>
                          <span className="detail-value">${formatPrice(booking.precioTotal)}</span>
                        </div>

                        {/* Botón de confirmar solo si está pendiente */}
                        {booking.estado === 'pendiente' && (
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirmBooking(booking._id)}
                            style={{ marginTop: '10px', width: '100%' }}
                          >
                            Confirmar Reserva
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDriver;
