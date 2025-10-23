// login-driver.js

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
            // Llamar al backend real
            const response = await loginUser(email, password);

            if (response.success) {
                console.log('Login successful!', response);

                // Extraer datos reales de la respuesta
                const user = response.data.user;
                const token = response.data.token;

                // 🔹 VALIDAR QUE EL ROL DEL USUARIO SEA DRIVER
                const userRole = user.rol.toLowerCase();
                if (userRole !== 'driver' && userRole !== 'conductor') {
                    throw new Error('Access denied. This login is only for drivers. Please use the rider login.');
                }

                // Guardar datos de sesión
                sessionStorage.setItem('userEmail', user.correo);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
                sessionStorage.setItem('userRole', user.rol);
                
                // 🔹 Guardar datos adicionales si existen en el backend
                if (user.identificacion || user.university_id || user.id_universidad) {
                    sessionStorage.setItem('universityId', user.identificacion || user.university_id || user.id_universidad);
                }
                if (user.telefono || user.phone || user.celular) {
                    sessionStorage.setItem('userPhone', user.telefono || user.phone || user.celular);
                }

                // 🔹 Redirigir a dashboard de driver (CORREGIDO)
                redirectToDriverDashboard();
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Invalid credentials. Please try again.');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 🔹 Función de redirección corregida
    function redirectToDriverDashboard() {
        // profile-view.html está en la misma carpeta que login-driver.html
        // Ambos están en: frontend/pages/shared/
        
        console.log('Redirecting to driver dashboard...');
        console.log('Current location:', window.location.pathname);
        
        // Ruta correcta: mismo directorio
        window.location.href = 'profile-view.html';
    }

    // Función para usar tu API real
    async function loginUser(email, password) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, password })
            });

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error connecting to backend:', error);
            throw new Error('Server error. Please try again later.');
        }
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
        setTimeout(() => hideError(), 5000);
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

    // Limpiar mensajes de error al escribir en los inputs
    emailInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);

    // Prevenir submit con Enter en campos individuales
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    console.log('Driver login page loaded');
    console.log('Current location:', window.location.pathname);
});