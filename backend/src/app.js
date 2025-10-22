const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ===== MIDDLEWARES DE SEGURIDAD =====
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// ===== MIDDLEWARES GENERALES =====
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS =====
// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚗 API de Wheels - Carpooling Universitario',
    version: '1.0.0',
    status: 'OK'
  });
});

// Rutas de autenticación - IMPORTANTE: Esta línea debe estar aquí
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ===== MANEJO DE ERRORES =====
// Ruta no encontrada (debe ir DESPUÉS de todas las rutas)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;