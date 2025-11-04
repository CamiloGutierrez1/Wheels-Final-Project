import React from 'react';

function TripCard({ trip, onSelect }) {
  const isBlocked = trip.asientosDisponibles === 0 || trip.estado === 'lleno';
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  const formatRoute = (ruta) => {
    if (Array.isArray(ruta)) {
      return ruta.join(' → ');
    }
    return ruta || 'N/A';
  };

  const formatRouteDetailed = (ruta) => {
    if (Array.isArray(ruta)) {
      return ruta.map((punto, index) => `${index + 1}. ${punto}`).join('\n');
    }
    return ruta || 'N/A';
  };

  return (
    <div className={`trip-card ${isBlocked ? 'blocked' : ''}`}>
      <span className={`status-badge ${isBlocked ? 'full' : 'available'}`}>
        {isBlocked ? 'LLENO' : 'DISPONIBLE'}
      </span>
      
      <div className="driver-info">
        <img
          src={trip.conductor?.foto || 'https://via.placeholder.com/50'}
          alt="Foto conductor"
          className="driver-photo"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/50';
          }}
        />
        <div className="driver-details">
          <h3>
            {trip.conductor?.nombre || 'Conductor'} {trip.conductor?.apellido || ''}
          </h3>
          <p>Tel: {trip.conductor?.telefono || 'N/A'}</p>
        </div>
      </div>
      
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
          {formatRouteDetailed(trip.ruta).split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
        <div className="detail-row">
          <span className="detail-label">Cupos disponibles:</span>
          <span className="detail-value">{trip.asientosDisponibles}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Hora de salida:</span>
          <span className="detail-value">{trip.hora}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Tarifa por pasajero:</span>
          <span className="detail-value">${formatPrice(trip.precio)}</span>
        </div>
      </div>
      
      <div className="trip-actions">
        <button
          className="btn-action btn-select"
          onClick={onSelect}
          disabled={isBlocked}
        >
          Seleccionar Viaje
        </button>
      </div>
    </div>
  );
}

export default TripCard;