// profile-view-rider.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Verificar si el usuario está autenticado
    checkAuthentication();

    // Cargar datos del usuario
    loadUserProfile();

    // Event listeners
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile-edit-rider.html';
    });

    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });

    // Función para verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn) {
            // Redirigir al login si no está autenticado
            window.location.href = 'login.html';
        }
    }

    // Función para cargar perfil del usuario
    async function loadUserProfile() {
        try {
            // OPCIÓN 1: Cargar desde API (cuando esté conectado)
            // const response = await fetch('http://localhost:3000/api/profile', {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            //     }
            // });
            // const userData = await response.json();

            // OPCIÓN 2: Datos simulados (mientras no hay backend)
            const userEmail = sessionStorage.getItem('userEmail');
            const userRole = 'rider'; // Fijo en rider
            
            // Intentar obtener datos del registro guardados
            const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
            
            const userData = {
                firstName: registrationData.firstName || 'Hugo',
                lastName: registrationData.lastName || 'Ocallega',
                email: userEmail || registrationData.email || 'hugo@gmail.com',
                universityId: registrationData.universityId || '0000123456',
                phone: registrationData.phone || '+57 3124785471',
                role: userRole
            };

            // Rellenar información personal
            document.getElementById('firstName').textContent = userData.firstName;
            document.getElementById('lastName').textContent = userData.lastName;
            document.getElementById('email').textContent = userData.email;
            document.getElementById('universityId').textContent = userData.universityId;
            document.getElementById('phone').textContent = userData.phone;
            document.getElementById('userName').textContent = userData.firstName;
            document.querySelector('.user-avatar').textContent = userData.firstName.charAt(0).toUpperCase();

            // Mostrar rol activo - Rider siempre activo
            const driverBadge = document.getElementById('driverBadge');
            const riderBadge = document.getElementById('riderBadge');
            
            riderBadge.classList.add('active');
            driverBadge.classList.remove('active');

            console.log('Rider profile loaded:', userData);
            
        } catch (error) {
            console.error('Error loading profile:', error);
            // Mostrar datos por defecto en caso de error
        }
    }

    // Función para hacer logout
    function handleLogout() {
        // Confirmar logout
        if (confirm('Are you sure you want to log out?')) {
            // Limpiar datos de sesión
            sessionStorage.clear();
            
            // Opcional: mantener el email si "remember me" estaba activo
            // localStorage.removeItem('selectedRole');
            
            // Redirigir al login
            window.location.href = 'login.html';
            
            console.log('User logged out');
        }
    }

    console.log('Rider profile view loaded');
});