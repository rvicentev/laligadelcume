/**
 * @fileoverview Controlador mixto para la carga de datos de clasificación
 * y la gestión de interactividad (acordeones) en las tarjetas de equipos.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ============================================================================
    // 1. CARGA DE DATOS DE CLASIFICACIÓN (CSV)
    // ============================================================================
    
    // [CIBERSEGURIDAD] Endpoint de datos (Sustituir por variable de entorno)
    const sheetUrl = "TU_URL_CSV_ESTADISTICAS_AQUI";
    const tableBody = document.querySelector("#tablaEstadisticas tbody");

    // Solo ejecutamos la petición HTTP si el elemento existe en el DOM actual
    if (tableBody) {
        fetch(sheetUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Fallo de red: ${response.status}`);
                return response.text();
            })
            .then(data => {
                // Descartamos la cabecera y filtramos saltos de línea vacíos
                const rows = data.split("\n").slice(1).filter(row => row.trim() !== ""); 
                
                rows.forEach((row, index) => {
                    const cols = row.split(",");
                    
                    // Verificación de integridad de la fila (10 columnas esperadas)
                    if (cols.length >= 10) {
                        const tr = document.createElement("tr");

                        // Marcador CSS para posiciones de Playoff / Ascenso (Top 4)
                        if (index < 4) {
                            tr.classList.add("playoff");
                        }

                        // Inyección: Posición
                        const tdPosicion = document.createElement("td");
                        tdPosicion.textContent = cols[0].trim();
                        tr.appendChild(tdPosicion);

                        // Inyección: Escudo y Nombre del Equipo
                        const tdNombre = document.createElement("td");
                        const teamName = cols[1].trim();
                        
                        const logoImg = document.createElement("img");
                        logoImg.src = `images/escudos_placeholder/${teamName}.png`;
                        logoImg.alt = `Escudo de ${teamName}`;
                        logoImg.style.height = "20px";
                        logoImg.style.marginRight = "8px";
                        logoImg.style.verticalAlign = "middle";
                        
                        // Fallback por defecto si la imagen no se encuentra en el servidor
                        logoImg.onerror = function() {
                            this.src = 'images/logo_secundario_placeholder.png';
                        };

                        tdNombre.appendChild(logoImg);
                        tdNombre.appendChild(document.createTextNode(teamName));
                        tr.appendChild(tdNombre);

                        // Inyección: Métricas restantes (Puntos, PJ, PG, PE, PP, GF, GC, DG)
                        for (let i = 2; i <= 9; i++) {
                            const tdStat = document.createElement("td");
                            tdStat.textContent = cols[i].trim();
                            tr.appendChild(tdStat);
                        }

                        tableBody.appendChild(tr);
                    }
                });
            })
            .catch(error => console.error("Excepción en la carga de estadísticas:", error));
    }

    // ============================================================================
    // 2. INTERACCIONES DE UI (ACORDEÓN DE EQUIPOS)
    // ============================================================================
    const teamCards = document.querySelectorAll('.equipo-card');
    
    teamCards.forEach(card => {
        card.addEventListener('click', () => {
            const detalle = card.querySelector('.equipo-detalle');
            if (!detalle) return;

            // Se utiliza scrollHeight para calcular dinámicamente el alto del contenido
            // y permitir que la transición CSS (max-height) sea fluida.
            if (card.classList.contains('expanded')) {
                detalle.style.maxHeight = '0px';
                card.classList.remove('expanded');
            } else {
                card.classList.add('expanded');
                detalle.style.maxHeight = `${detalle.scrollHeight}px`;
            }
        });
    });
});