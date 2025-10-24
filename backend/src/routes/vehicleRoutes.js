const express = require('express');
const router = express.Router();
const {
  registrarVehiculo,
  obtenerMiVehiculo,
  obtenerVehiculoPorConductor,
  eliminarVehiculo
} = require('../controllers/vehicleController');
const { protegerRuta, verificarRol } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route   POST /api/vehicles
 * @desc    Registrar o actualizar vehículo
 * @access  Private (solo conductores)
 */
router.post(
  '/',
  protegerRuta,
  verificarRol('conductor'),
  upload.fields([
    { name: 'fotoVehiculo', maxCount: 1 },
    { name: 'fotoSOAT', maxCount: 1 }
  ]),
  registrarVehiculo
);

/**
 * @route   GET /api/vehicles/my-vehicle
 * @desc    Obtener mi vehículo
 * @access  Private (solo conductores)
 */
router.get(
  '/my-vehicle',
  protegerRuta,
  verificarRol('conductor'),
  obtenerMiVehiculo
);

/**
 * @route   GET /api/vehicles/conductor/:conductorId
 * @desc    Obtener vehículo por ID de conductor
 * @access  Public
 */
router.get(
  '/conductor/:conductorId',
  obtenerVehiculoPorConductor
);

/**
 * @route   DELETE /api/vehicles
 * @desc    Eliminar mi vehículo
 * @access  Private (solo conductores)
 */
router.delete(
  '/',
  protegerRuta,
  verificarRol('conductor'),
  eliminarVehiculo
);

module.exports = router;