/**
 * @fileoverview Lógica para cargar y renderizar tablas de estadísticas desde Google Sheets.
 */

document.addEventListener("DOMContentLoaded", async () => {
    
    // =========================================================
    // CONFIGURACIÓN DE RUTAS (Sustituir por variables de entorno en producción)
    // IMPORTANTE: Nunca expongas URLs de Google Sheets con datos privados.
    // =========================================================
    const urlGoleadoresCSV = "URL_PUBLICADA_CSV_GOLEADORES";
    const urlClasificacionCSV = "URL_PUBLICADA_CSV_CLASIFICACION";
    const urlClasificacionTSV = "URL_PUBLICADA_TSV_CLASIFICACION";

    // Función auxiliar para obtener y parsear un archivo CSV remoto
    async function getCSV(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        // Detección dinámica del separador (Google Sheets puede devolver ';' o ',')
        const sep = text.includes(";") ? ";" : ",";
        return text.trim().split("\n").map(r => r.split(sep).map(c => c.trim().replace(/^"|"$/g, "")));
    }

    try {
        // =========================================================
        // 1. TABLA: GOLEADORES (PICHICHIS)
        // =========================================================
        const goleadoresRaw = await getCSV(urlGoleadoresCSV);

        // Filtramos datos vacíos, parseamos enteros y ordenamos de mayor a menor
        const filasGoleadores = goleadoresRaw
            .filter(r => r.length >= 3 && r[0] && r[1] && r[2])
            .map(r => ({
                equipo: r[0],
                jugador: r[1],
                goles: parseInt(r[2]) || 0
            }))
            .sort((a, b) => b.goles - a.goles)
            .slice(0, 20); // Top 20 goleadores

        const tbodyG = document.querySelector("#tablaGoleadores tbody");
        if (tbodyG) {
            tbodyG.innerHTML = "";
            filasGoleadores.forEach((d, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${i + 1}</td>
                    <td class="equipo-cell">
                        <img class="equipo-logo" src="images/escudos_placeholder/${d.equipo}.png" alt="${d.equipo}" onerror="this.src='images/logo_secundario_placeholder.png'"> ${d.equipo}
                    </td>
                    <td>${d.jugador}</td>
                    <td>${d.goles}</td>
                `;
                tbodyG.appendChild(tr);
            });
        }

        // =========================================================
        // 2. TABLAS SECUNDARIAS: MÁS GOLEADORES / MENOS GOLEADOS
        // =========================================================
        const clasificacionRaw = await getCSV(urlClasificacionCSV);
        // Suponemos que la fila 0 es la cabecera. Slice(1,8) toma del 1º al 7º equipo.
        const equiposClas = clasificacionRaw.slice(1, 8).map(r => r[1]);
        const golesAFavor = clasificacionRaw.slice(1, 8).map(r => parseInt(r[7]) || 0);
        const golesEnContra = clasificacionRaw.slice(1, 8).map(r => parseInt(r[8]) || 0);

        // --- Equipos más goleadores ---
        const tbodyMas = document.querySelector("#tablaMasGoleadores tbody");
        if (tbodyMas) {
            tbodyMas.innerHTML = "";
            const masGoleadores = equiposClas.map((eq, i) => ({ equipo: eq, goles: golesAFavor[i] }))
                .sort((a, b) => b.goles - a.goles);
                
            masGoleadores.forEach((e, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${i + 1}</td>
                    <td class="equipo-cell">
                        <img class="equipo-logo" src="images/escudos_placeholder/${e.equipo}.png" alt="${e.equipo}" onerror="this.src='images/logo_secundario_placeholder.png'"> ${e.equipo}
                    </td>
                    <td>${e.goles}</td>
                `;
                tbodyMas.appendChild(tr);
            });
        }

        // --- Equipos menos goleados ---
        const tbodyMenos = document.querySelector("#tablaMenosGoleados tbody");
        if (tbodyMenos) {
            tbodyMenos.innerHTML = "";
            const menosGoleados = equiposClas.map((eq, i) => ({ equipo: eq, golesContra: golesEnContra[i] }))
                .sort((a, b) => a.golesContra - b.golesContra);
                
            menosGoleados.slice(0, 7).forEach((e, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${i + 1}</td>
                    <td class="equipo-cell">
                        <img class="equipo-logo" src="images/escudos_placeholder/${e.equipo}.png" alt="${e.equipo}" onerror="this.src='images/logo_secundario_placeholder.png'"> ${e.equipo}
                    </td>
                    <td>${e.golesContra}</td>
                `;
                tbodyMenos.appendChild(tr);
            });
        }

        // =========================================================
        // 3. BLOQUE LÍDERES: CLASIFICACIÓN (2º a 8º Puesto)
        // =========================================================
        // Se usa TSV (Tab Separated Values) en este bloque por decisión de arquitectura
        const responseTSV = await fetch(urlClasificacionTSV);
        if(responseTSV.ok) {
            const textTSV = await responseTSV.text();
            const clasificacionTSV = textTSV.trim().split("\n").map(r => r.split("\t").map(c => c.trim()));
            // Evitamos la cabecera (0) y al líder (1). Cogemos del 2 al 7 (índices 2 a 8).
            const filas2a8 = clasificacionTSV.slice(2, 8);

            const listaClasificacion = document.getElementById("listaClasificacion");
            if (listaClasificacion) {
                listaClasificacion.innerHTML = "";
                filas2a8.forEach((fila, i) => {
                    const posicion = i + 2;
                    const equipo = fila[1];
                    const puntos = fila[2];
                    
                    if (equipo && puntos) {
                        const li = document.createElement("li");
                        li.innerHTML = `
                            <div class="posicion">${posicion}</div>
                            <div class="equipo-info">
                                <img src="images/escudos_placeholder/${equipo}.png" alt="${equipo}" onerror="this.src='images/logo_secundario_placeholder.png'"> ${equipo}
                            </div>
                            <div class="puntos">${puntos}</div>
                        `;
                        listaClasificacion.appendChild(li);
                    }
                });
            }
        }

    } catch (err) {
        console.error("Error crítico cargando datos de estadísticas:", err);
    }
});


// =========================================================
// GESTIÓN DEL MENÚ RESPONSIVE
// (Nota: Si tu proyecto tiene un archivo global tipo main.js o index.js 
// que ya controla esto, puedes borrar este bloque para evitar redundancia).
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!menuToggle || !navLinks) return;

    let isAnimating = false; // Prevención de doble pulsación rápida

    function setExpanded(isOpen) {
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isAnimating) return;
        isAnimating = true;

        navLinks.classList.toggle("show");
        const isOpen = navLinks.classList.contains("show");
        setExpanded(isOpen);

        setTimeout(() => { isAnimating = false; }, 300);
    }

    menuToggle.addEventListener("click", toggleMenu);

    // Cierre al hacer click fuera
    document.addEventListener("click", function (event) {
        if (window.innerWidth <= 900) {
            const isClickInside = navLinks.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInside && navLinks.classList.contains("show")) {
                navLinks.classList.remove("show");
                setExpanded(false);
            }
        }
    });

    // Cierre por cambio a vista escritorio
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && navLinks.classList.contains("show")) {
            navLinks.classList.remove("show");
            setExpanded(false);
        }
    });

    // Cierre tras pulsar un enlace (UX móvil)
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 900 && navLinks.classList.contains("show")) {
                navLinks.classList.remove("show");
                setExpanded(false);
            }
        });
    });
});