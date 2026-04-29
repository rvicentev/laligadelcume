/**
 * @fileoverview Lógica del Calendario Interactivo, gestión de modales y menú móvil.
 */

document.addEventListener("DOMContentLoaded", function () {
    // --------------------------------------------------------
    // CONTROLADOR DEL MENÚ MÓVIL
    // --------------------------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    function setExpanded(isOpen) {
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function toggleMenu(e) {
        if (e) e.preventDefault();
        navLinks.classList.toggle("show");
        setExpanded(navLinks.classList.contains("show"));
    }

    menuToggle.addEventListener("click", toggleMenu);
    menuToggle.addEventListener("touchstart", toggleMenu, { passive: false });

    // Cierre al hacer click fuera del contenedor
    document.addEventListener("click", function (event) {
        const isClickInside = navLinks.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInside && navLinks.classList.contains("show")) {
            navLinks.classList.remove("show");
            setExpanded(false);
        }
    }, { passive: true });

    // Reseteo visual al pasar a vista de escritorio
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && navLinks.classList.contains("show")) {
            navLinks.classList.remove("show");
            setExpanded(false);
        }
    });
});

// --------------------------------------------------------
// CONFIGURACIÓN DEL CALENDARIO Y DATOS DE LIGA
// --------------------------------------------------------
const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Base de datos de enfrentamientos anonimizada
const jornadas = [
    {
        start: '2025-10-14', end: '2025-10-24', label: 'J1',
        matches: [
            { local: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' }, visitante: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' } },
            { local: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
        ]
    },
    {
        start: '2025-10-25', end: '2025-11-04', label: 'J2',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' } },
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
            { local: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' }, visitante: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' } },
        ]
    },
    {
        start: '2025-11-05', end: '2025-11-15', label: 'J3',
        matches: [
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' } },
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
            { local: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
        ]
    },
    {
        start: '2025-11-16', end: '2025-11-26', label: 'J4',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' } },
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
        ]
    },
    {
        start: '2025-11-27', end: '2025-12-07', label: 'J5',
        matches: [
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' } },
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
        ]
    },
    {
        start: '2025-12-08', end: '2025-12-19', label: 'J6',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
            { local: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' }, visitante: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' } },
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
        ]
    },
    {
        start: '2026-02-01', end: '2026-02-10', label: 'J7',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' } },
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
        ]
    },
    {
        start: '2026-02-11', end: '2026-02-20', label: 'J8',
        matches: [
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' } },
        ]
    },
    {
        start: '2026-02-21', end: '2026-03-02', label: 'J9',
        matches: [
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' } },
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
        ]
    },
    {
        start: '2026-03-03', end: '2026-03-12', label: 'J10',
        matches: [
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' } },
            { local: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
        ]
    },
    {
        start: '2026-03-13', end: '2026-03-22', label: 'J11',
        matches: [
            { local: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' }, visitante: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' } },
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' } },
        ]
    },
    {
        start: '2026-03-23', end: '2026-04-01', label: 'J12',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
            { local: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
        ]
    },
    {
        start: '2026-04-02', end: '2026-04-10', label: 'J13',
        matches: [
            { local: { name: 'EQUIPO CHARLIE', logo: 'images/escudos_placeholder/equipo_charlie.png' }, visitante: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' } },
            { local: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' }, visitante: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' } },
            { local: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' }, visitante: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' } },
        ]
    },
    {
        start: '2026-04-11', end: '2026-04-19', label: 'J14',
        matches: [
            { local: { name: 'EQUIPO GOLF', logo: 'images/escudos_placeholder/equipo_golf.png' }, visitante: { name: 'EQUIPO ALPHA', logo: 'images/escudos_placeholder/equipo_alpha.png' } },
            { local: { name: 'EQUIPO ECHO', logo: 'images/escudos_placeholder/equipo_echo.png' }, visitante: { name: 'EQUIPO BRAVO', logo: 'images/escudos_placeholder/equipo_bravo.png' } },
            { local: { name: 'EQUIPO DELTA', logo: 'images/escudos_placeholder/equipo_delta.png' }, visitante: { name: 'EQUIPO FOXTROT', logo: 'images/escudos_placeholder/equipo_foxtrot.png' } },
        ]
    }
];

// Ventana de traspasos
const mercadoStart = new Date('2025-12-20T00:00:00');
const mercadoEnd = new Date('2026-01-31T23:59:59');

// --------------------------------------------------------
// MOTOR DE RENDERIZADO DEL CALENDARIO
// --------------------------------------------------------
function renderCalendar(month, year) {
    calendarEl.innerHTML = '';
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    // Cabecera de días (L, M, X...)
    dayNames.forEach(day => {
        const el = document.createElement('div');
        el.classList.add('day-header');
        el.textContent = day;
        calendarEl.appendChild(el);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Ajuste para que la semana empiece en Lunes
    const totalDays = lastDay.getDate();

    // Rellenado de celdas vacías previas al día 1
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.classList.add('day', 'empty');
        calendarEl.appendChild(emptyEl);
    }

    // Generación de los días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('day');
        dayEl.textContent = day;

        const current = new Date(year, month, day);

        // Resaltar día actual
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        let isMatchDay = false;

        // Comprobación de solapamiento con jornadas de liga
        jornadas.forEach(j => {
            const start = new Date(j.start);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(j.end);
            end.setHours(23, 59, 59, 999);

            if (current >= start && current <= end) {
                isMatchDay = true;
                const tag = document.createElement('div');
                tag.classList.add('jornada');
                tag.textContent = j.label;
                dayEl.appendChild(tag);
                
                // Binding de evento para abrir el modal de partidos
                dayEl.addEventListener('click', () => openModal(j));
            }
        });

        // Comprobación de solapamiento con mercado de fichajes (solo si no hay liga)
        if (!isMatchDay && current >= mercadoStart && current <= mercadoEnd) {
            const tag = document.createElement('div');
            tag.classList.add('jornada', 'mercado'); 
            tag.textContent = 'M';
            dayEl.appendChild(tag);
            dayEl.addEventListener('click', () => openMercadoModal());
        }

        calendarEl.appendChild(dayEl);
    }
}

// --------------------------------------------------------
// EVENTOS DE NAVEGACIÓN Y MODALES
// --------------------------------------------------------
document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Elementos del Modal
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const matchesContainer = document.getElementById('matchesContainer');

function openModal(jornada) {
    modalTitle.textContent = jornada.label;
    matchesContainer.innerHTML = '';
    
    jornada.matches.forEach(m => {
        const div = document.createElement('div');
        div.classList.add('match');
        // Renderizado dinámico de la tarjeta del partido
        div.innerHTML = `
            <div><img src="${m.local.logo}" alt="${m.local.name}"> ${m.local.name}</div>
            <div>-</div>
            <div>${m.visitante.name} <img src="${m.visitante.logo}" alt="${m.visitante.name}"></div>
        `;
        matchesContainer.appendChild(div);
    });
    
    modal.style.display = 'flex';
}

function openMercadoModal() {
    modalTitle.textContent = "MERCADO DE FICHAJES";
    matchesContainer.innerHTML = `
        <div style="text-align: center; font-size: 1.1em; color: #2c2c2c; padding: 20px;">
            <p style="margin-bottom: 10px;"><strong>Periodo de traspasos abierto</strong></p>
            <p>Desde el 20 de Diciembre<br>hasta el 31 de Enero</p>
        </div>
    `;
    modal.style.display = 'flex';
}

// Controladores de cierre del modal
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
});

// Inicialización
renderCalendar(currentMonth, currentYear);