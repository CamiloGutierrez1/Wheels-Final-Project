document.addEventListener('DOMContentLoaded', () => {
    const driverBtn = document.getElementById('driver-btn');
    const riderBtn = document.getElementById('rider-btn');

    //Evento para driver
    driverBtn.addEventListener('click', () => {
        handleRoleSelection('driver');
    });

    //Evento para rider
    riderBtn.addEventListener('click', () => {
        handleRoleSelection('rider');
    });

    function handleRoleSelection(role) {
        console.log(`Role selected: ${role}`);

        //Guardar la seleccion del rol en localStorage
        localStorage.setItem('selectedRole', role);

        // Animación del botón 
        const selectedBtn = role === 'driver' ? driverBtn : riderBtn;
        selectedBtn.style.transform = 'scale(0.95)';

        //Esperar animaión y redirigir
        setTimeout(() => {
            selectedBtn.style.transform = 'scale(1)';
            redirectToLogin (role);
        },200);
    }
    // Reidirigir a login
    function redirectToLogin(role) {
        window.location.href = 'pages/shared/login.html';
    }
    
    //efecto hover
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(button => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'all 0.3s ease';
        });
    });
    
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
        console.log(`Previously selected role: ${savedRole}`);
    }
});

