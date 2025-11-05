// profile-edit.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const driverBtn = document.getElementById('driverBtn');
    const riderBtn = document.getElementById('riderBtn');
    const vehicleEditSection = document.getElementById('vehicleEditSection');
    const capacityButtons = document.querySelectorAll('.capacity-btn-edit');
    const capacityInput = document.getElementById('capacity');
    const logoutBtn = document.getElementById('logoutBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    let selectedRole = 'driver'; // Por defecto

    // Verificar autenticación
    checkAuthentication();

    // Cargar datos actuales del usuario
    loadCurrentProfile();

    // Event listeners para rol buttons
    driverBtn.addEventListener('click', () => {
        selectRole('driver');
    });

    riderBtn.addEventListener('click', () => {
        selectRole('rider');
    });

    // Event listeners para capacity buttons
    capacityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            capacityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            capacityInput.value = btn.dataset.capacity;
        });
    });

    // Event listener para el formulario
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveProfile();
    });

    // Event listener para cancelar (volver atrás)
    logoutBtn.addEventListener('click', () => {
        handleCancel();
    });

    // Función para verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    }

    // Función para cargar perfil actual desde el backend
    async function loadCurrentProfile() {
        try {
            const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            // Llamar al backend para obtener perfil completo
            const response = await fetch('https://wheels-final-project.onrender.com/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error loading profile');
            }

            const profileData = await response.json();
            const user = profileData.data.user;

            // Rellenar formulario con datos del usuario
            document.getElementById('firstName').value = user.nombre || '';
            document.getElementById('lastName').value = user.apellido || '';
            document.getElementById('email').value = user.correo || '';
            document.getElementById('universityId').value = user.idUniversidad || '';
            document.getElementById('phone').value = user.telefono || '';

            // Actualizar nombre en top bar
            document.getElementById('userName').textContent = user.nombre;
            document.querySelector('.user-avatar').textContent = user.nombre.charAt(0).toUpperCase();

            // Establecer rol basado en el usuario
            if (user.rol === 'conductor' || user.conductorRegistrado) {
                selectedRole = 'driver';
                selectRole('driver');

                // Si es conductor, cargar datos del vehículo
                await loadVehicleData(authToken);
            } else {
                selectedRole = 'rider';
                selectRole('rider');
            }

            console.log('Profile loaded for editing:', user);

        } catch (error) {
            console.error('Error loading profile:', error);
            showError('Error loading profile. Please try again.');
        }
    }

    // Función para cargar datos del vehículo
    async function loadVehicleData(authToken) {
        try {
            const response = await fetch('https://wheels-final-project.onrender.com/api/vehicles/my-vehicle', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.vehiculo) {
                    const vehicle = data.data.vehiculo;
                    document.getElementById('licensePlate').value = vehicle.placa || '';
                    document.getElementById('make').value = vehicle.marca || '';
                    document.getElementById('model').value = vehicle.modelo || '';

                    const capacity = vehicle.capacidad || 4;
                    capacityInput.value = capacity;

                    // Activar botón de capacidad correspondiente
                    capacityButtons.forEach(btn => {
                        if (btn.dataset.capacity === capacity.toString()) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        } catch (error) {
            console.log('No vehicle found or error loading vehicle:', error);
        }
    }

    // Función para seleccionar rol
    function selectRole(role) {
        selectedRole = role;

        if (role === 'driver') {
            driverBtn.classList.add('active');
            riderBtn.classList.remove('active');
            vehicleEditSection.style.display = 'block';
        } else {
            riderBtn.classList.add('active');
            driverBtn.classList.remove('active');
            vehicleEditSection.style.display = 'none';
        }

        console.log('Role selected:', role);
    }

    // Función para guardar cambios del perfil
    async function handleSaveProfile() {
        // Obtener valores del formulario
        const updatedData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            universityId: document.getElementById('universityId').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value.trim(),
            role: selectedRole
        };

        // Validar campos obligatorios
        if (!updatedData.firstName || !updatedData.lastName || !updatedData.phone) {
            showError('Please fill in all required fields');
            return;
        }

        // Si es driver, incluir datos del vehículo
        if (selectedRole === 'driver') {
            const licensePlate = document.getElementById('licensePlate').value.trim();
            const make = document.getElementById('make').value.trim();
            const model = document.getElementById('model').value.trim();

            if (licensePlate && make && model) {
                updatedData.vehicle = {
                    licensePlate: licensePlate,
                    make: make,
                    model: model,
                    capacity: parseInt(capacityInput.value)
                };
            }
        }

        // Mostrar loading
        const submitBtn = editProfileForm.querySelector('.btn-save');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            // Simular guardado (cuando conectes con backend, reemplaza esto)
            await saveProfileChanges(updatedData);

            // Actualizar datos en localStorage
            const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
            const mergedData = { ...registrationData, ...updatedData };
            localStorage.setItem('registrationData', JSON.stringify(mergedData));
            
            // Actualizar sessionStorage
            sessionStorage.setItem('userEmail', updatedData.email);
            localStorage.setItem('selectedRole', updatedData.role);

            // Mostrar mensaje de éxito
            showSuccess('Profile updated successfully!');

            // Redirigir a vista de perfil después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'profile-view.html';
            }, 1500);

        } catch (error) {
            showError(error.message || 'Failed to update profile');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función para guardar en backend (simulada)
    async function saveProfileChanges(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // TODO: Reemplazar con llamada real al API
                /*
                const response = await fetch('http://localhost:3000/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                return result;
                */

                console.log('Profile updated:', data);
                resolve({ success: true });
            }, 1000);
        });
    }

    // Función para cancelar y volver a profile view
    function handleCancel() {
        if (confirm('Discard changes and go back?')) {
            window.location.href = 'profile-view.html';
        }
    }

    // Mostrar mensaje de éxito
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';

        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';

        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Limpiar mensajes al escribir
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        });
    });

    console.log('Profile edit page loaded');
});