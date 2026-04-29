(function() {
    'use strict';

    // Expandir/colapsar tarjetas de equipos
    document.querySelectorAll('.equipo-card').forEach(function(card) {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // Menú responsive
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        navLinks.classList.toggle('show');
        const isOpen = navLinks.classList.contains('show');
        menuToggle.setAttribute('aria-expanded', isOpen);
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('touchstart', toggleMenu, { passive: false });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Cerrar menú al redimensionar a pantalla grande
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900 && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
})();