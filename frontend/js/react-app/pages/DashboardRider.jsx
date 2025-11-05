import React, { useState, useEffect } from 'react';
import FiltersSection from '../components/FiltersSection';
import TripCard from '../components/TripCard';
import TripModal from '../components/TripModal';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function DashboardRider() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    origen: '',
    cupos: '',
    estado: 'activo'
  });

  // Cargar información del usuario y verificar auth
  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (isAuthenticated) {
      loadUserInfo();
      loadTrips();
    }
  }, []);

  // Verificar autenticación
  const checkAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    console.log('🔐 Verificando autenticación...', { 
      hasLocalToken: !!localStorage.getItem('token'),
      hasSessionToken: !!sessionStorage.getItem('authToken'),
      token: token ? 'presente' : 'ausente'
    });
    
    if (!token) {
      console.log('❌ No hay token, redirigiendo al login');
      // Desde dashboard.html que está en pages/shared/, login.html está en el mismo directorio
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 100);
      return false;
    }
    
    console.log('✅ Token encontrado, usuario autenticado');
    return true;
  };

  // Cargar información del usuario desde el backend
  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      // Obtener datos actualizados del usuario desde el backend
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          const user = data.data.user;

          // Actualizar localStorage con los datos más recientes
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);

          setUserInfo({
            name: `${user.nombre} ${user.apellido}`,
            role: user.rol || 'usuario',
            conductorRegistrado: user.conductorRegistrado || false
          });

          console.log('✅ Usuario cargado desde backend:', {
            nombre: `${user.nombre} ${user.apellido}`,
            conductorRegistrado: user.conductorRegistrado
          });
          return;
        }
      }

      // Si falla la petición, usar datos del localStorage como fallback
      console.warn('⚠️ No se pudo cargar desde backend, usando localStorage');
      const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;

      setUserInfo({
        name: userName,
        role: userData?.rol || 'usuario',
        conductorRegistrado: userData?.conductorRegistrado || false
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);

      // Fallback a localStorage si hay error
      const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;

      setUserInfo({
        name: userName,
        role: userData?.rol || 'usuario',
        conductorRegistrado: userData?.conductorRegistrado || false
      });
    }
  };

  // Cargar viajes
  const loadTrips = async (newFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      const activeFilters = newFilters || filters;
      
      if (activeFilters.origen) params.append('origen', activeFilters.origen);
      if (activeFilters.cupos) params.append('cupos', activeFilters.cupos);
      if (activeFilters.estado) params.append('estado', activeFilters.estado);
      
      const url = `${API_BASE_URL}/trips${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTrips(data.data.trips || []);
      } else {
        setError(data.message || 'Error al cargar viajes');
        setTrips([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    loadTrips(searchFilters);
  };

  // Seleccionar viaje
  const handleSelectTrip = (trip) => {
    if (trip.asientosDisponibles === 0 || trip.estado === 'lleno') {
      alert('Este viaje está lleno');
      return;
    }
    setSelectedTrip(trip);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  // Manejar reserva exitosa
  const handleReservationSuccess = () => {
    setShowModal(false);
    setSelectedTrip(null);
    loadTrips(); // Recargar viajes
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('token');
      sessionStorage.clear();
      // Desde dashboard.html que está en pages/shared/, login.html está en el mismo directorio
      window.location.href = 'login.html';
    }
  };

  // Convertirse en conductor
  const handleBecomeDriver = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      // Verificar si el usuario ya tiene un vehículo registrado
      const response = await fetch(`${API_BASE_URL}/vehicles/my-vehicle`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Si ya tiene vehículo registrado, redirigir al dashboard de conductor
        if (data.success && data.data.vehicle) {
          console.log('✅ Usuario ya tiene vehículo registrado, redirigiendo a dashboard de conductor');

          // Actualizar el rol en el storage
          const userDataString = localStorage.getItem('user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            userData.rol = 'conductor';
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userRole', 'conductor');
            sessionStorage.setItem('userRole', 'conductor');
          }

          // Redirigir al dashboard de conductor
          window.location.href = 'dashboard.html#/dashboard/driver';
          return;
        }
      }

      // Si no tiene vehículo, redirigir a registro de vehículo
      console.log('ℹ️ Usuario sin vehículo, redirigiendo a registro');
      window.location.href = 'register-vehicle.html';

    } catch (error) {
      console.error('Error al verificar vehículo:', error);
      // En caso de error, redirigir a registro de vehículo por seguridad
      window.location.href = 'register-vehicle.html';
    }
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
            <span className="user-name">{userInfo?.name || 'Usuario'}</span>
            {!userInfo?.conductorRegistrado && (
              <button className="btn-conductor" onClick={handleBecomeDriver}>
                Convertirse en Conductor
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Filtros */}
        <FiltersSection onSearch={handleSearch} />

        {/* Sección de Viajes */}
        <section className="trips-section">
          <h2 className="section-title">Viajes Disponibles</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando viajes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn-retry" onClick={() => loadTrips()}>
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && trips.length === 0 && (
            <div className="empty-state">
              <p>No hay viajes disponibles</p>
            </div>
          )}

          {/* Trips Grid */}
          {!loading && !error && trips.length > 0 && (
            <div className="trips-container">
              {trips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onSelect={() => handleSelectTrip(trip)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Selección */}
      {showModal && selectedTrip && (
        <TripModal
          trip={selectedTrip}
          onClose={handleCloseModal}
          onSuccess={handleReservationSuccess}
        />
      )}
    </div>
  );
}

export default DashboardRider;