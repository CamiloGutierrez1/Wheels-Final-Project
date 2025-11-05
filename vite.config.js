import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'frontend',
    server: {
        port: 5501,
        open: '/pages/shared/dashboard.html#/dashboard/rider'
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'frontend/index.html'),
                login: resolve(__dirname, 'frontend/pages/shared/login.html'),
                'register-rider': resolve(__dirname, 'frontend/pages/shared/register-rider.html'),
                'register-vehicle': resolve(__dirname, 'frontend/pages/shared/register-vehicle.html'),
                dashboard: resolve(__dirname, 'frontend/pages/shared/dashboard.html'),
                'profile-view': resolve(__dirname, 'frontend/pages/shared/profile-view.html'),
                'profile-view-rider': resolve(__dirname, 'frontend/pages/shared/profile-view-rider.html'),
                'profile-edit': resolve(__dirname, 'frontend/pages/shared/profile-edit.html'),
                'profile-edit-rider': resolve(__dirname, 'frontend/pages/shared/profile-edit-rider.html')
            }
        },
        assetsInlineLimit: 0  // No inline assets, mantener archivos separados
    }
});