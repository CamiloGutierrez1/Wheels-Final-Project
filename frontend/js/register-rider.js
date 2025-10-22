// register-rider.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Rider registration page loaded');

    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    
    let selectedRole = 'rider'; // Fijo en rider

    // Los botones son solo visuales, no tienen funcionalidad
    // El botón Rider ya está en negro desde el HTML

    // Event listener para el formulario
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });

    // Función principal para manejar el registro
    async function handleRegister() {
        // Obtener valores del formulario
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            universityId: document.getElementById('universityId').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value.trim(),
            role: selectedRole
        };

        // Limpiar error previo
        hideError();

        // Validaciones
        if (!validateForm(formData)) {
            return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('registrationData', JSON.stringify(formData));
        localStorage.setItem('selectedRole', selectedRole);

        console.log('Rider registration data saved:', formData);

        // Mostrar loading
        const submitBtn = registerForm.querySelector('.btn-next');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            // Simular registro (API)
            await registerRider(formData);
            
            // Registro exitoso
            sessionStorage.setItem('userEmail', formData.email);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'rider');

            console.log('✅ Registration successful. Redirecting to profile...');

            // Redirigir a profile-view-rider
            setTimeout(() => {
                window.location.href = 'profile-view-rider.html';
            }, 500);

        } catch (error) {
            console.error('❌ Registration error:', error);
            showError(error.message || 'Registration failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Validar formulario
    function validateForm(data) {
        // Validar campos vacíos
        if (!data.firstName || !data.lastName || !data.universityId || 
            !data.email || !data.phone || !data.password) {
            showError('Please fill in all fields');
            return false;
        }

        // Validar email
        if (!isValidEmail(data.email)) {
            showError('Please enter a valid email address');
            return false;
        }

        // Validar email corporativo (debe contener .edu)
        if (!data.email.includes('.edu')) {
            showError('Please use your corporate university email');
            return false;
        }

        // Validar ID universitario (solo números)
        if (!/^\d+$/.test(data.universityId)) {
            showError('University ID must contain only numbers');
            return false;
        }

        // Validar teléfono (formato básico)
        if (data.phone.length < 10) {
            showError('Please enter a valid phone number');
            return false;
        }

        // Validar contraseña
        if (data.password.length < 6) {
            showError('Password must be at least 6 characters');
            return false;
        }

        return true;
    }

    // Validar formato de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Registrar usuario rider (API simulada)
    async function registerRider(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // TODO: Reemplazar con llamada real a API
                /*
                const response = await fetch('http://localhost:3000/api/auth/register-rider', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                return result;
                */

                console.log('Registering rider:', data);
                resolve({ success: true });
            }, 1000);
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

    // Limpiar errores al escribir
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', hideError);
    });
});