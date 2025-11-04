import { cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Copiando archivos JS y CSS al dist...');

try {
    // Copiar carpeta js
    cpSync(
        join(__dirname, '../frontend/js'),
        join(__dirname, '../dist/js'),
        { recursive: true }
    );
    console.log('✅ Carpeta js copiada');

    // Copiar carpeta css
    cpSync(
        join(__dirname, '../frontend/css'),
        join(__dirname, '../dist/css'),
        { recursive: true }
    );
    console.log('✅ Carpeta css copiada');

    console.log('🎉 Assets copiados exitosamente!');
} catch (error) {
    console.error('❌ Error copiando assets:', error);
    process.exit(1);
}
