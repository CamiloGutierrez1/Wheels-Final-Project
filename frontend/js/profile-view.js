// profile-view.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const vehicleInfoBtn = document.getElementById('vehicleInfoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const vehicleSection = document.getElementById('vehicleSection');

    // Verificar si el usuario está autenticado
    checkAuthentication();

    // Cargar datos del usuario
    loadUserProfile();

    // Event listeners
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile-edit.html';
    });

    vehicleInfoBtn.addEventListener('click', () => {
        // Toggle vehicle section visibility
        if (vehicleSection.style.display === 'none') {
            vehicleSection.style.display = 'block';
            vehicleInfoBtn.textContent = 'Hide Vehicle Info';
        } else {
            vehicleSection.style.display = 'none';
            vehicleInfoBtn.textContent = 'Vehicle Info';
        }
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
            // Obtener datos del sessionStorage (guardados en el login)
            const userName = sessionStorage.getItem('userName');
            const userEmail = sessionStorage.getItem('userEmail');
            const userRole = sessionStorage.getItem('userRole');
            
            // Extraer nombre y apellido
            const nameParts = userName ? userName.split(' ') : ['', ''];
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || '';

            // 🔹 Construir objeto de usuario con datos reales del backend
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: userEmail || 'No email',
                universityId: 'Loading...', // 👈 Este vendrá del backend
                phone: 'Loading...', // 👈 Este vendrá del backend
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

            // 🔹 Mostrar rol activo
            const driverBadge = document.getElementById('driverBadge');
            const riderBadge = document.getElementById('riderBadge');

            if (userData.role === 'driver' || userData.role === 'conductor') {
                driverBadge.classList.add('active');
                riderBadge.classList.remove('active');
                
                // 🔹 Intentar cargar datos del vehículo desde el backend
                await loadVehicleInfo();
                
            } else {
                riderBadge.classList.add('active');
                driverBadge.classList.remove('active');
                vehicleSection.style.display = 'none';
                vehicleInfoBtn.style.display = 'none';
            }

            console.log('User profile loaded:', userData);
            
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // 🔹 Función para cargar información del vehículo desde el backend
    async function loadVehicleInfo() {
        try {
            const authToken = sessionStorage.getItem('authToken');
            
            // Llamar al endpoint de vehículos cuando esté disponible
            const response = await fetch('http://localhost:5000/api/vehicles/my-vehicle', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const vehicleData = await response.json();
                
                // Si hay datos de vehículo, mostrar la sección
                if (vehicleData && vehicleData.data) {
                    const vehicle = vehicleData.data;
                    
                    // Rellenar datos del vehículo
                    document.getElementById('licensePlate').textContent = vehicle.placa || 'N/A';
                    document.getElementById('make').textContent = vehicle.marca || 'N/A';
                    document.getElementById('model').textContent = vehicle.modelo || 'N/A';
                    document.getElementById('capacity').textContent = vehicle.capacidad || 'N/A';
                    
                    // Mostrar sección de vehículo
                    vehicleSection.style.display = 'block';
                    vehicleInfoBtn.style.display = 'block';
                    
                    console.log('Vehicle info loaded:', vehicle);
                } else {
                    // No hay vehículo registrado
                    console.log('No vehicle registered yet');
                    showNoVehicleMessage();
                }
            } else if (response.status === 404) {
                // Endpoint no existe aún o no hay vehículo registrado
                console.log('Vehicle endpoint not available or no vehicle found');
                showNoVehicleMessage();
            } else {
                throw new Error('Error loading vehicle info');
            }
            
        } catch (error) {
            console.error('Error loading vehicle:', error);
            // Si no hay endpoint, mostrar mensaje
            showNoVehicleMessage();
        }
    }

    // 🔹 Mostrar mensaje cuando no hay vehículo
    function showNoVehicleMessage() {
        vehicleSection.style.display = 'none';
        vehicleInfoBtn.style.display = 'none';
        
        // Opcional: mostrar mensaje al usuario
        console.log('No vehicle information available');
        
        // Puedes agregar un mensaje en la UI si quieres
        // const message = document.createElement('div');
        // message.className = 'info-message';
        // message.textContent = 'No vehicle registered. Please add your vehicle information.';
        // document.querySelector('.action-buttons').before(message);
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

    console.log('Profile view loaded');
});