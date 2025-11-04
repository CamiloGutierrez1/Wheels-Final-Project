import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importar CSS
import '../../css/dashboard-rider.css';

// Ocultar pantalla de carga
setTimeout(() => {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}, 500);

// Renderizar React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);