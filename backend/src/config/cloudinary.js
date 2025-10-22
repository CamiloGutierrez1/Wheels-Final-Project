const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Subir imagen a Cloudinary
 * @param {String} filePath - Ruta del archivo temporal
 * @param {String} folder - Carpeta en Cloudinary
 * @returns {Promise} - Resultado de la subida
 */
const uploadImage = async (filePath, folder = 'wheels') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limitar tamaño
        { quality: 'auto' } // Optimización automática
      ]
    });
    return result;
  } catch (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param {String} publicId - ID público de la imagen
 * @returns {Promise}
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage
};