const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');

/**
 * @desc    Registrar o actualizar vehículo del conductor
 * @route   POST /api/vehicles
 * @access  Private (solo conductores)
 */
const registrarVehiculo = async (req, res) => {
  try {
    const { placa, marca, modelo, capacidad } = req.body;
    const conductorId = req.user._id;

    // Verificar que el usuario sea conductor
    if (req.user.rol !== 'conductor' && req.user.rol !== 'ambos') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden registrar vehículos'
      });
    }

    // Verificar que se subieron las imágenes
    if (!req.files || !req.files.fotoVehiculo || !req.files.fotoSOAT) {
      return res.status(400).json({
        success: false,
        message: 'Debes subir la foto del vehículo y del SOAT'
      });
    }

    // Subir imágenes a Cloudinary
    const fotoVehiculoResult = await uploadImage(
      req.files.fotoVehiculo[0].buffer, 
      'wheels/vehicles'
    );
    const fotoSOATResult = await uploadImage(
      req.files.fotoSOAT[0].buffer, 
      'wheels/soat'
    );

    // Buscar si ya tiene un vehículo registrado
    let vehiculo = await Vehicle.findOne({ conductorId });

    if (vehiculo) {
      // Actualizar vehículo existente
      vehiculo.placa = placa;
      vehiculo.marca = marca || '';
      vehiculo.modelo = modelo;
      vehiculo.capacidad = capacidad;
      vehiculo.fotoVehiculo = fotoVehiculoResult.secure_url;
      vehiculo.fotoSOAT = fotoSOATResult.secure_url;
      await vehiculo.save();

      const usuario = await User.findById(conductorId);
      if (usuario.rol === 'pasajero') {
      usuario.rol = 'ambos';
      usuario.conductorRegistrado = true;
      await usuario.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Vehículo actualizado exitosamente',
        data: { vehiculo }
      });
    } else {
      // Crear nuevo vehículo
      vehiculo = new Vehicle({
        conductorId,
        placa,
        marca: marca || '',
        modelo,
        capacidad,
        fotoVehiculo: fotoVehiculoResult.secure_url,
        fotoSOAT: fotoSOATResult.secure_url
      });

      await vehiculo.save();

      const usuario = await User.findById(conductorId);
      usuario.rol = 'ambos';
      usuario.conductorRegistrado = true;
      await usuario.save();

      return res.status(201).json({
        success: true,
        message: 'Vehículo registrado exitosamente',
        data: { vehiculo }
      });
    }
  } catch (error) {
    console.error('Error al registrar vehículo:', error);
    
    // Manejo de errores específicos
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'La placa del vehículo ya está registrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar vehículo',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener vehículo del conductor autenticado
 * @route   GET /api/vehicles/my-vehicle
 * @access  Private (solo conductores)
 */
const obtenerMiVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findOne({ conductorId: req.user._id });

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un vehículo registrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { vehiculo }
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener vehículo por ID de conductor
 * @route   GET /api/vehicles/conductor/:conductorId
 * @access  Public
 */
const obtenerVehiculoPorConductor = async (req, res) => {
  try {
    const { conductorId } = req.params;
    
    const vehiculo = await Vehicle.findOne({ conductorId });

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Este conductor no tiene vehículo registrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { vehiculo }
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar vehículo
 * @route   DELETE /api/vehicles
 * @access  Private (solo conductores)
 */
const eliminarVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findOne({ conductorId: req.user._id });

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un vehículo registrado'
      });
    }

    await vehiculo.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vehículo',
      error: error.message
    });
  }
};

module.exports = {
  registrarVehiculo,
  obtenerMiVehiculo,
  obtenerVehiculoPorConductor,
  eliminarVehiculo
};