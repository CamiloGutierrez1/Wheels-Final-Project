// login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorMessage = document.getElementById('errorMessage');

    // Cargar email guardado si existe
    loadRememberedEmail();

    // Event listener para el formulario
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Función principal para manejar el login
    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        // Limpiar mensaje de error previo
        hideError();

        // Validaciones básicas
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        // Guardar email si "Remember me" está marcado
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Mostrar loading en el botón
        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            // Aquí harás la llamada a tu API backend
            // Por ahora simulamos un login exitoso
            const response = await loginUser(email, password);

            if (response.success) {
                // Login exitoso
                console.log('Login successful!');
                
                // Guardar datos de sesión
                sessionStorage.setItem('userEmail', email);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('authToken', response.token || 'mock-token');

                // Obtener el rol guardado previamente (desde role-selection)
                const selectedRole = localStorage.getItem('selectedRole') || 'rider';
                
                // Redirigir según el rol
                redirectToDashboard(selectedRole);
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }

        } catch (error) {
            // Error en el login
            console.error('Login error:', error);
            showError(error.message || 'Invalid credentials. Please try again.');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función para hacer login (reemplazar con API real)
    async function loginUser(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulación de validación
                // TODO: Reemplazar con fetch a tu backend
                /*
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                return data;
                */

                // Por ahora acepta cualquier email con contraseña >= 6 caracteres
                if (password.length >= 6) {
                    resolve({ 
                        success: true, 
                        token: 'mock-jwt-token-12345',
                        user: { email }
                    });
                } else {
                    reject({ message: 'Invalid credentials' });
                }
            }, 1500);
        });
    }

    // Validar formato de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    // Ocultar mensaje de error
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // Cargar email recordado del localStorage
    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Redirigir al dashboard según el rol
    function redirectToDashboard(role) {
        console.log(`Redirecting to ${role} dashboard...`);
        
        if (role === 'driver') {
            window.location.href = '../driver/dashboard.html';
        } else if (role === 'rider') {
            window.location.href = '../rider/dashboard.html';
        } else {
            // Por defecto, ir a rider
            window.location.href = '../rider/dashboard.html';
        }
    }

    // Limpiar mensajes de error al escribir en los inputs
    emailInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);

    // Prevenir submit con Enter en campos individuales (opcional)
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // Debug: Mostrar info en consola
    console.log('Login page loaded');
    console.log('Selected role from previous page:', localStorage.getItem('selectedRole'));
});