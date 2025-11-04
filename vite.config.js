import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'frontend',
    server: {
        port: 5501,
        open: '/pages/shared/dashboard.html#/dashboard/rider'  // ← AGREGUÉ #/dashboard/rider
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'frontend/index.html'),
                dashboard: resolve(__dirname, 'frontend/pages/shared/dashboard.html')
            }
        }
    }
});