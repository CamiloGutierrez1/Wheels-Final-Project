// register-vehicle.js

document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const capacityButtons = document.querySelectorAll('.capacity-btn');
    const capacityInput = document.getElementById('capacity');
    const vehiclePhotoInput = document.getElementById('vehiclePhoto');
    const vehiclePhotoName = document.getElementById('vehiclePhotoName');
    const soatPhotoInput = document.getElementById('soatPhoto');
    const soatPhotoName = document.getElementById('soatPhotoName');
    const errorMessage = document.getElementById('errorMessage');

    // Manejar selección de capacidad con botones
    capacityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos los botones
            capacityButtons.forEach(b => b.classList.remove('active'));
            
            // Agregar active al botón clickeado
            btn.classList.add('active');
            
            // Actualizar valor del input hidden
            capacityInput.value = btn.dataset.capacity;
            
            console.log('Capacity selected:', btn.dataset.capacity);
        });
    });

    // Manejar selección de foto del vehículo
    vehiclePhotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            vehiclePhotoName.textContent = e.target.files[0].name;
            vehiclePhotoName.classList.add('has-file');
        } else {
            vehiclePhotoName.textContent = 'No file chosen';
            vehiclePhotoName.classList.remove('has-file');
        }
    });

    // Hacer que el span abra el file input
    vehiclePhotoName.addEventListener('click', () => {
        vehiclePhotoInput.click();
    });

    // Manejar selección de foto del SOAT
    soatPhotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            soatPhotoName.textContent = e.target.files[0].name;
            soatPhotoName.classList.add('has-file');
        } else {
            soatPhotoName.textContent = 'No file chosen';
            soatPhotoName.classList.remove('has-file');
        }
    });

    // Hacer que el span abra el file input
    soatPhotoName.addEventListener('click', () => {
        soatPhotoInput.click();
    });

    // Event listener para el formulario
    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleVehicleSubmit();
    });

    // Función principal para manejar el envío del vehículo
    async function handleVehicleSubmit() {
        // Obtener valores del formulario
        const vehicleData = {
            licensePlate: document.getElementById('licensePlate').value.trim().toUpperCase(),
            make: document.getElementById('make').value,
            model: document.getElementById('model').value,
            capacity: parseInt(capacitySlider.value),
            vehiclePhoto: vehiclePhotoInput.files[0],
            soatPhoto: soatPhotoInput.files[0]
        };

        // Limpiar error previo
        hideError();

        // Validaciones
        if (!validateVehicleForm(vehicleData)) {
            return;
        }

        // Obtener datos del usuario del paso anterior
        const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');

        // Combinar datos del usuario y del vehículo
        const completeData = {
            ...registrationData,
            vehicle: {
                licensePlate: vehicleData.licensePlate,
                make: vehicleData.make,
                model: vehicleData.model,
                capacity: vehicleData.capacity
            }
        };

        console.log('Complete registration data:', completeData);

        // Mostrar loading
        const submitBtn = vehicleForm.querySelector('.btn-next');
        const originalText = submitBtn.innerHTML;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            // Registrar usuario con vehículo
            await registerDriver(completeData, vehicleData.vehiclePhoto, vehicleData.soatPhoto);

            // Registro exitoso
            sessionStorage.setItem('userEmail', registrationData.email);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'driver');

            // Limpiar datos temporales
            localStorage.removeItem('registrationData');

            // Redirigir al dashboard del conductor
            setTimeout(() => {
                window.location.href = '../driver/dashboard.html';
            }, 500);

        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Validar formulario del vehículo
    function validateVehicleForm(data) {
        // Validar placa
        if (!data.licensePlate || data.licensePlate.length < 5) {
            showError('Please enter a valid license plate');
            return false;
        }

        // Validar marca
        if (!data.make) {
            showError('Please select a vehicle make');
            return false;
        }

        // Validar modelo
        if (!data.model) {
            showError('Please select a vehicle model');
            return false;
        }

        // Las fotos son opcionales según los requisitos
        // pero puedes hacerlas obligatorias si quieres

        return true;
    }

    // Registrar conductor con vehículo (API simulada)
    async function registerDriver(data, vehiclePhoto, soatPhoto) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // TODO: Reemplazar con llamada real a API
                /*
                const formData = new FormData();
                formData.append('userData', JSON.stringify(data));
                if (vehiclePhoto) formData.append('vehiclePhoto', vehiclePhoto);
                if (soatPhoto) formData.append('soatPhoto', soatPhoto);

                const response = await fetch('http://localhost:3000/api/auth/register-driver', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                return result;
                */

                console.log('Registering driver with vehicle:', data);
                if (vehiclePhoto) console.log('Vehicle photo:', vehiclePhoto.name);
                if (soatPhoto) console.log('SOAT photo:', soatPhoto.name);
                
                resolve({ success: true });
            }, 1500);
        });
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    // Ocultar mensaje de error
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // Limpiar errores al escribir/cambiar
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', hideError);
        input.addEventListener('change', hideError);
    });

    console.log('Vehicle registration page loaded');
    console.log('User data from step 1:', localStorage.getItem('registrationData'));
});