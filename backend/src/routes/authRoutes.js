const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  cerrarTodasSesiones,
  obtenerPerfil,
  verificarEstadoConductor
} = require('../controllers/authController');
const { validarRegistro, validarLogin } = require('../validators/authValidator');
const { protegerRuta } = require('../middlewares/authMiddleware');

// ===== RUTAS PÚBLICAS =====
/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', validarRegistro, registrarUsuario);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', validarLogin, iniciarSesion);

// ===== RUTAS PRIVADAS (Requieren autenticación) =====
/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión actual
 * @access  Private
 */
router.post('/logout', protegerRuta, cerrarSesion);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Cerrar todas las sesiones del usuario
 * @access  Private
 */
router.post('/logout-all', protegerRuta, cerrarTodasSesiones);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/me', protegerRuta, obtenerPerfil);

/**
 * @route   GET /api/auth/check-driver-status
 * @desc    Verificar estado de conductor del usuario
 * @access  Private
 */
router.get('/check-driver-status', protegerRuta, verificarEstadoConductor);

module.exports = router;