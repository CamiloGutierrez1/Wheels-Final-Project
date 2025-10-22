const User = require('../models/User');
const { generarToken } = require('../utils/jwtUtils');

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, idUniversidad, correo, password, telefono, rol, foto } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({
      $or: [{ correo }, { idUniversidad }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo o ID de universidad ya está registrado'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      apellido,
      idUniversidad,
      correo,
      password,
      telefono,
      rol: rol || 'pasajero',
      foto
    });

    await nuevoUsuario.save();

    // Generar token
    const token = generarToken({ id: nuevoUsuario._id, correo: nuevoUsuario.correo });

    // Agregar token a la lista de tokens activos del usuario
    await nuevoUsuario.agregarToken(token);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: nuevoUsuario,
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Public
 */
const iniciarSesion = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario por correo e incluir el password
    const usuario = await User.findOne({ correo }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValido = await usuario.compararPassword(password);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que la cuenta esté activa
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador'
      });
    }

    // Generar token
    const token = generarToken({ id: usuario._id, correo: usuario.correo });

    // Agregar token a la lista de tokens activos
    await usuario.agregarToken(token);

    // Remover password del objeto antes de enviarlo
    usuario.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: usuario,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * @desc    Cerrar sesión (logout)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const cerrarSesion = async (req, res) => {
  try {
    // El token y usuario vienen del middleware de autenticación
    await req.user.removerToken(req.token);

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
};

/**
 * @desc    Cerrar todas las sesiones
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const cerrarTodasSesiones = async (req, res) => {
  try {
    await req.user.removerTodosTokens();

    res.status(200).json({
      success: true,
      message: 'Todas las sesiones fueron cerradas exitosamente'
    });
  } catch (error) {
    console.error('Error en logout-all:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar todas las sesiones',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener perfil del usuario autenticado
 * @route   GET /api/auth/me
 * @access  Private
 */
const obtenerPerfil = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  cerrarTodasSesiones,
  obtenerPerfil
};