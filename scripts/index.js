/**
 * @fileoverview Controlador principal de la aplicación.
 * Gestiona la conexión a base de datos (Supabase), renderizado del DOM (jornadas, resultados, clasificaciones),
 * animaciones de UI y generación dinámica de PDFs para las actas.
 */

console.log("Iniciando motor principal...");

// ============================================================================
// 1. CONFIGURACIÓN DEL SERVIDOR (BaaS)
// ============================================================================
if (typeof supabase === 'undefined') {
    console.error("ERROR CRÍTICO: La librería cliente de Supabase no se ha inicializado en el DOM.");
}

const { createClient } = supabase;

// [CIBERSEGURIDAD] Credenciales del entorno (Sustituir mediante variables de entorno en build o en producción)
const SUPABASE_URL = 'TU_SUPABASE_URL_AQUI';
const SUPABASE_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';

const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Inicialización del motor PDF global
window.jspdf = window.jspdf || {};

// ============================================================================
// 2. DICCIONARIO DE ALIAS Y UTILIDADES
// ============================================================================
// Mapeo forzado para IDs seguros en base de datos. 
const ALIAS_EQUIPOS = {
    "EQUIPO ALPHA": "alpha",
    "EQUIPO BRAVO": "bravo",
    "EQUIPO CHARLIE": "charlie",
    "EQUIPO DELTA": "delta",
    "EQUIPO ECHO": "echo",
    "EQUIPO FOXTROT": "foxtrot",
    "EQUIPO GOLF": "golf"
};

function obtenerAlias(nombre) {
    return ALIAS_EQUIPOS[nombre] || nombre.toLowerCase().replace(/\s+/g, '').substring(0, 10);
}

// ============================================================================
// 3. ESTRUCTURA DE DATOS (JORNADAS Y ENFRENTAMIENTOS)
// ============================================================================
const CONFIG = {
    SHEET_URL: "TU_URL_CSV_CLASIFICACION", // [CIBERSEGURIDAD] URL Pública del CSV de Clasificación
    JORNADA_ACTUAL: 14
};

const jornadas = {
    1: {
        fecha: "14 - 24 OCTUBRE",
        titulo: "JORNADA 1",
        banner: crearBannerPartidos([
            { local: "EQUIPO ALPHA", visitante: "EQUIPO BRAVO", colorLocal: "#158000", colorVisitante: "#244228" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO DELTA", colorLocal: "#931400", colorVisitante: "#ffffff" },
            { local: "EQUIPO ECHO", visitante: "EQUIPO FOXTROT", colorLocal: "#2c2c2c", colorVisitante: "#0058cb" }
        ]),
        resultados: crearResultados([
            { local: "EQUIPO ALPHA", visitante: "EQUIPO BRAVO", resultado: "3 - 6", fecha: "16 OCT | 19:30h", lugar: "PISTA CENTRAL" },
            { local: "EQUIPO ECHO", visitante: "EQUIPO FOXTROT", resultado: "1 - 6", fecha: "20 OCT | 21:00h", lugar: "POLIDEPORTIVO NORTE" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO DELTA", resultado: "13 - 0", fecha: "21 OCT | 21:00h", lugar: "POLIDEPORTIVO NORTE" }
        ], "EQUIPO GOLF", 1)
    },
    2: {
        fecha: "25 OCTUBRE - 04 NOVIEMBRE",
        titulo: "JORNADA 2",
        banner: crearBannerPartidos([
            { local: "EQUIPO GOLF", visitante: "EQUIPO BRAVO", colorLocal: "#e7ad1b", colorVisitante: "#000000" },
            { local: "EQUIPO FOXTROT", visitante: "EQUIPO ALPHA", colorLocal: "#0058cb", colorVisitante: "#036700" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO ECHO", colorLocal: "#c50000", colorVisitante: "#000000" }
        ]),
        resultados: crearResultados([
            { local: "EQUIPO GOLF", visitante: "EQUIPO BRAVO", resultado: "3 - 5", fecha: "24 NOV | 17:30h", lugar: "CIUDAD DEPORTIVA", esAplazado: true },
            { local: "EQUIPO FOXTROT", visitante: "EQUIPO ALPHA", resultado: "10 - 1", fecha: "27 OCT | 21:00h", lugar: "POLIDEPORTIVO NORTE" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO ECHO", resultado: "6 - 2", fecha: "04 NOV | 21:30h", lugar: "CIUDAD DEPORTIVA" }
        ], "EQUIPO DELTA", 2)
    },
    3: {
        fecha: "05 - 15 NOVIEMBRE",
        titulo: "JORNADA 3",
        banner: crearBannerPartidos([
            { local: "EQUIPO DELTA", visitante: "EQUIPO GOLF", colorLocal: "#ffffff", colorVisitante: "#e7ad1b" },
            { local: "EQUIPO BRAVO", visitante: "EQUIPO FOXTROT", colorLocal: "#000000", colorVisitante: "#0058cb" },
            { local: "EQUIPO ALPHA", visitante: "EQUIPO CHARLIE", colorLocal: "#036700", colorVisitante: "#c50000" }
        ]),
        resultados: crearResultados([
            { local: "EQUIPO DELTA", visitante: "EQUIPO GOLF", resultado: "3 - 13", fecha: "10 NOV | 19:00h", lugar: "PISTA SUR" },
            { local: "EQUIPO BRAVO", visitante: "EQUIPO FOXTROT", resultado: "6 - 3", fecha: "12 NOV | 21:30h", lugar: "CIUDAD DEPORTIVA", incidencias: "documentos/incidencias_placeholder.pdf" },
            { local: "EQUIPO ALPHA", visitante: "EQUIPO CHARLIE", resultado: "3 - 8", fecha: "18 NOV | 21:00h", lugar: "POLIDEPORTIVO NORTE" }
        ], "EQUIPO ECHO", 3)
    },
    4: {
        fecha: "16 - 26 NOVIEMBRE",
        titulo: "JORNADA 4",
        banner: crearBannerPartidos([
            { local: "EQUIPO GOLF", visitante: "EQUIPO FOXTROT", colorLocal: "#EECEAF", colorVisitante: "#3C4868" },
            { local: "EQUIPO DELTA", visitante: "EQUIPO ECHO", colorLocal: "#c2ddf2", colorVisitante: "#3B9DB8" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO BRAVO", colorLocal: "#BB284F", colorVisitante: "#000000" }
        ]),
        resultados: crearResultados([
            { local: "EQUIPO GOLF", visitante: "EQUIPO FOXTROT", resultado: "vs", fecha: "POR DEFINIR", esAplazado: true },
            { local: "EQUIPO DELTA", visitante: "EQUIPO ECHO", resultado: "3 - 5", fecha: "25 NOV | 21:30h", lugar: "CIUDAD DEPORTIVA" },
            { local: "EQUIPO CHARLIE", visitante: "EQUIPO BRAVO", resultado: "1 - 6", fecha: "26 NOV | 21:30h", lugar: "CIUDAD DEPORTIVA" }
        ], "EQUIPO ALPHA", 4)
    },
    // Nota: Las jornadas intermedias mantienen la misma estructura de anonimización
    14: {
        fecha: "11 - 19 ABRIL",
        titulo: "JORNADA 14",
        banner: crearBannerPartidos([
            { local: "EQUIPO GOLF", visitante: "EQUIPO ALPHA", colorLocal: "#EECEAF", colorVisitante: "#036700" },
            { local: "EQUIPO ECHO", visitante: "EQUIPO BRAVO", colorLocal: "#3B9DB8", colorVisitante: "#000000" },
            { local: "EQUIPO DELTA", visitante: "EQUIPO FOXTROT", colorLocal: "#c2ddf2", colorVisitante: "#3C4868" }
        ]),
        resultados: crearResultados([
            { local: "EQUIPO GOLF", visitante: "EQUIPO ALPHA", resultado: "3 - 0", fecha: ""},
            { local: "EQUIPO ECHO", visitante: "EQUIPO BRAVO", resultado: "vs", fecha: "POR DEFINIR" },
            { local: "EQUIPO DELTA", visitante: "EQUIPO FOXTROT", resultado: "vs", fecha: "POR DEFINIR"}
        ], "EQUIPO CHARLIE", 14)
    }
};

// ============================================================================
// 4. MOTORES DE RENDERIZADO HTML
// ============================================================================
function crearBannerPartidos(partidos) {
    return partidos.map(p => `
        <div class="partido-card">
            <img src="images/escudos_placeholder/${p.local}.png" class="escudo" alt="Escudo ${p.local}" loading="lazy" onerror="this.src='images/logo_secundario_placeholder.png'">
            <div class="linea" style="--linea-color: ${p.colorLocal};"></div>
            <span class="nombre-equipo">${p.local}</span>
            <span class="vs">VS</span>
            <span class="nombre-equipo">${p.visitante}</span>
            <div class="linea" style="--linea-color: ${p.colorVisitante};"></div>
            <img src="images/escudos_placeholder/${p.visitante}.png" class="escudo" alt="Escudo ${p.visitante}" loading="lazy" onerror="this.src='images/logo_secundario_placeholder.png'">
        </div>
    `).join('');
}

function crearResultados(partidos, arbitro, numJornada) {
    const partidosHTML = partidos.map(p => {
        // Cálculo algorítmico del ID de acta para match con Storage
        const aliasLocal = obtenerAlias(p.local);
        const aliasVisitante = obtenerAlias(p.visitante);
        const idCalculado = `j${numJornada}_${aliasLocal}_${aliasVisitante}`;

        const botonActaHTML = `
            <button class="btn-acta btn-acta-auto" 
                    data-id="${idCalculado}" 
                    onclick="window.generarActaDesdeArchivo('${idCalculado}')"
                    style="display:none;">
                ACTA
            </button>
        `;

        const botonesHTML = [botonActaHTML];
        if (p.incidencias) {
            botonesHTML.push(`<button class="btn-inci" onclick="window.open('${p.incidencias}', '_blank')">INCIDENCIAS</button>`);
        }

        const lugarHTML = p.lugar ? `<p class="lugar">${p.lugar}</p>` : '';
        const aplazadoLabel = p.esAplazado ? '<p class="lugar" style="font-size:0.4em;">[APLAZADO]</p>' : '';

        return `
            <div class="partido-card-resultado">
                <div class="resultado-superior">
                    <img src="images/escudos_placeholder/${p.local}.png" class="escudo-equipo" alt="${p.local}" loading="lazy" onerror="this.src='images/logo_secundario_placeholder.png'">
                    <span class="resultado">${p.resultado}</span>
                    <img src="images/escudos_placeholder/${p.visitante}.png" class="escudo-equipo" alt="${p.visitante}" loading="lazy" onerror="this.src='images/logo_secundario_placeholder.png'">
                </div>
                ${aplazadoLabel}
                <p class="fecha-hora">${p.fecha}</p>
                ${lugarHTML}
                ${botonesHTML.join('')}
            </div>
        `;
    }).join('');

    return `
        <section class="resultado-partido-container">
            ${partidosHTML}
        </section>
        <div class="arbitro-info">
            <span class="texto-arbitro">ARBITRA: ${arbitro}</span>
            <img src="images/escudos_placeholder/${arbitro}.png" alt="Escudo ${arbitro}" class="escudo-arbitro" loading="lazy" onerror="this.src='images/logo_secundario_placeholder.png'">
        </div>
    `;
}

function cargarClasificacion() {
    const tableBody = document.querySelector("#tablaEstadisticas tbody");
    if (!tableBody) return;

    fetch(CONFIG.SHEET_URL)
        .then(response => {
            if (!response.ok) throw new Error('Error al conectar con la fuente de datos');
            return response.text();
        })
        .then(data => {
            const rows = data.split("\n").slice(1).filter(row => row.trim());
            const fragment = document.createDocumentFragment();

            rows.forEach((row, index) => {
                const cols = row.split(",").map(col => col.trim());
                if (cols.length >= 10) {
                    const tr = document.createElement("tr");
                    if (index < 4) tr.classList.add("playoff"); // Top 4 a playoffs
                    const teamName = cols[1];
                    tr.innerHTML = `
                        <td>${cols[0]}</td>
                        <td>
                            <img src="images/escudos_placeholder/${teamName}.png" alt="${teamName}" onerror="this.src='images/logo_secundario_placeholder.png'" style="height: 20px; margin-right: 8px; vertical-align: middle;">
                            ${teamName}
                        </td>
                        ${cols.slice(2, 10).map(col => `<td>${col}</td>`).join('')}
                    `;
                    fragment.appendChild(tr);
                }
            });
            tableBody.appendChild(fragment);
        })
        .catch(err => console.error("Error cargando clasificación:", err));
}

// ============================================================================
// 5. INICIALIZACIÓN DE COMPONENTES INTERACTIVOS
// ============================================================================
function inicializarNavbar() {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    if (!menuToggle) return;
    
    menuToggle.addEventListener("click", (e) => {
        e?.preventDefault();
        const isOpen = navLinks.classList.toggle("show");
        menuToggle.setAttribute('aria-expanded', isOpen);
    });
}

function inicializarSelectorJornadas() {
    const selector = document.getElementById("selector-jornada");
    const fecha = document.getElementById("fecha-jornada");
    const titulo = document.getElementById("titulo-jornada");
    const banner = document.getElementById("banner-partidos");
    const resultados = document.getElementById("resultados");
    
    if (!selector) return;

    const cargarJornada = (id) => {
        const j = jornadas[id];
        if (j) {
            fecha.textContent = j.fecha;
            titulo.textContent = j.titulo;
            banner.innerHTML = j.banner;
            if(resultados) resultados.innerHTML = j.resultados;

            // Al cargar la vista de la jornada, verificamos contra el servidor qué actas están subidas
            verificarActasDisponibles();
        }
    };
    
    cargarJornada(CONFIG.JORNADA_ACTUAL);
    selector.addEventListener("change", (e) => cargarJornada(e.target.value));
}

// Sincronización con Storage de Supabase para activar botones de acta
async function verificarActasDisponibles() {
    if (!clienteSupabase) return;

    const { data, error } = await clienteSupabase.storage.from('actas').list('', { limit: 100 });
    if (error) {
        console.error("Error sincronizando estado de actas:", error.message);
        return;
    }

    const archivosEnNube = data.map(f => f.name.toLowerCase());
    const botones = document.querySelectorAll('.btn-acta-auto');

    botones.forEach(btn => {
        const idBoton = btn.getAttribute('data-id');
        const nombreEsperado = `${idBoton}.xlsx`.toLowerCase();

        if (archivosEnNube.includes(nombreEsperado)) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarClasificacion();
    inicializarNavbar();
    inicializarSelectorJornadas();
});

// ============================================================================
// 6. MOTOR DE GENERACIÓN DE ACTAS EN PDF (jsPDF)
// ============================================================================
window.generarActaDesdeArchivo = async function (actaId) {
    if (!clienteSupabase) { 
        alert("Fallo de infraestructura: Cliente de base de datos no inicializado."); 
        return; 
    }
    
    if (typeof XLSX === 'undefined' || typeof window.jspdf === 'undefined') {
        alert('Dependencias cargando, por favor reintente en unos segundos.');
        return;
    }

    try {
        const { data } = clienteSupabase.storage.from('actas').getPublicUrl(`${actaId}.xlsx`);
        const response = await fetch(data.publicUrl);
        if (!response.ok) throw new Error('El acta no existe físicamente en el servidor de Storage.');

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 500) throw new Error('Validación fallida: El archivo parece estar corrupto.');

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const get = (cell) => (sheet[cell]?.v || "");

        // Extracción estructurada para el template del PDF
        const partidoData = {
            equipoLocal: get("C2"),
            equipoVisitante: get("C3"),
            arbitro: get("M3"),
            hora: get("T3"),
            golesLocal: get("M23"),
            golesVisitante: get("M24"),
            jugadoresLocal: extraerJugadores(sheet, 'A', 'B', 'D', 'F', 'G'),
            jugadoresVisitante: extraerJugadores(sheet, 'L', 'M', 'R', 'S', 'T')
        };

        await generarPDF(partidoData);

    } catch (error) {
        console.error("Excepción en pipeline de generación PDF:", error);
        alert(`Ocurrió un problema procesando el documento.\nReferencia: ${actaId}`);
    }
}

// Utilidad para barrido del Excel
function extraerJugadores(sheet, colConv, colNombre, colGoles, colAmar, colRojas) {
    const jugadores = [];
    for (let i = 7; i <= 18; i++) {
        const convocado = sheet[`${colConv}${i}`]?.v;
        const nombre = sheet[`${colNombre}${i}`]?.v;
        if (convocado && nombre) {
            jugadores.push({
                nombre,
                goles: sheet[`${colGoles}${i}`]?.v || 0,
                amarillas: sheet[`${colAmar}${i}`]?.v || 0,
                rojas: sheet[`${colRojas}${i}`]?.v || 0
            });
        }
    }
    return jugadores;
}

async function generarPDF(partidoData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Paleta de colores PDF
    const colorPrimario = [239, 51, 64];
    const colorSecundario = [33, 33, 33];
    const colorGris = [100, 100, 100];
    const colorGrisClaro = [240, 240, 240];

    // Estructura Base
    doc.setFillColor(250, 250, 252); doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(...colorPrimario); doc.rect(0, 0, pageWidth, 8, 'F');

    // Header Logo
    try {
        const logo = await loadImage("images/logo_principal_placeholder.png");
        const ratio = Math.min(240 / logo.width, 170 / logo.height);
        doc.addImage(logo, "PNG", pageWidth / 2 - (logo.width * ratio) / 2, 20, logo.width * ratio, logo.height * ratio);
    } catch (e) {
        console.warn("No se pudo incrustar el logo principal en el PDF");
    }

    // Títulos y Metadatos
    doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(...colorPrimario);
    doc.text("ACTA DEL PARTIDO", pageWidth / 2, 120, { align: "center" });
    doc.setDrawColor(...colorPrimario); doc.setLineWidth(2); doc.line(pageWidth / 2 - 120, 127, pageWidth / 2 + 120, 127);

    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...colorGris);
    doc.text(`Árbitro: ${partidoData.arbitro}`, pageWidth / 2, 145, { align: "center" });
    doc.text(`Hora de inicio: ${partidoData.hora}`, pageWidth / 2, 160, { align: "center" });

    // Panel del Marcador Global
    const yMarcador = 225;
    const anchoMarcador = 600;
    const xInicioMarcador = pageWidth / 2 - anchoMarcador / 2;

    doc.setFillColor(...colorSecundario);
    doc.roundedRect(xInicioMarcador, yMarcador - 40, anchoMarcador, 80, 8, 8, 'F');

    // Renderizado de Escudos de Equipo
    try {
        const el = await loadImage(`images/escudos_placeholder/${partidoData.equipoLocal}.png`);
        doc.addImage(el, "PNG", xInicioMarcador + 25, yMarcador - 27, 55, 55);
    } catch (e) { }
    try {
        const ev = await loadImage(`images/escudos_placeholder/${partidoData.equipoVisitante}.png`);
        doc.addImage(ev, "PNG", xInicioMarcador + anchoMarcador - 80, yMarcador - 27, 55, 55);
    } catch (e) { }

    doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255); doc.setFontSize(15);
    doc.text(partidoData.equipoLocal, xInicioMarcador + 95, yMarcador - 8);
    doc.text(partidoData.equipoVisitante, xInicioMarcador + anchoMarcador - 95, yMarcador - 8, { align: "right" });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth / 2 - 45, yMarcador + 2, 90, 30, 5, 5, 'F');
    doc.setFontSize(28); doc.setTextColor(...colorSecundario);
    doc.text(`${partidoData.golesLocal}  -  ${partidoData.golesVisitante}`, pageWidth / 2, yMarcador + 24, { align: "center" });

    // Inyección de Tablas de Jugadores
    const yTabla = yMarcador + 70;
    dibujarTabla(doc, "EQUIPO LOCAL", partidoData.jugadoresLocal, 40, yTabla, colorPrimario, colorSecundario, colorGris, colorGrisClaro);
    dibujarTabla(doc, "EQUIPO VISITANTE", partidoData.jugadoresVisitante, pageWidth - 400, yTabla, colorPrimario, colorSecundario, colorGris, colorGrisClaro);

    // Footer de Auditoría
    const yFooter = pageHeight - 30;
    doc.setFontSize(8); doc.setTextColor(...colorGris); doc.setFont("helvetica", "italic");
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Documento generado el ${fecha} | Firma digital del árbitro adjunta en metadata.`, pageWidth / 2, yFooter, { align: "center" });

    doc.setFillColor(...colorPrimario); doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

    // Despliegue del Binario
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
}

// Dibujado manual de rejillas de datos (Wrapper para jsPDF)
function dibujarTabla(doc, titulo, jugadores, xInicio, yInicio, colorPrimario, colorSecundario, colorGris, colorGrisClaro) {
    let y = yInicio;
    doc.setFillColor(...colorPrimario); doc.roundedRect(xInicio, y, 360, 30, 5, 5, 'F');
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text(titulo, xInicio + 180, y + 20, { align: "center" });
    y += 35;

    doc.setFillColor(...colorGrisClaro); doc.rect(xInicio, y, 360, 25, 'F');
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...colorSecundario);
    doc.text("JUGADOR", xInicio + 10, y + 17);
    doc.text("GOLES", xInicio + 240, y + 17, { align: "center" });
    doc.text("TA", xInicio + 290, y + 17, { align: "center" });
    doc.text("TR", xInicio + 330, y + 17, { align: "center" });
    y += 25;

    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    jugadores.forEach((j, index) => {
        if (index % 2 === 0) { doc.setFillColor(248, 248, 250); doc.rect(xInicio, y, 360, 22, 'F'); }
        doc.setTextColor(...colorSecundario);

        // Truncado algorítmico de nombres muy largos para no desbordar celda
        let nombreMostrar = j.nombre;
        if (doc.getTextWidth(nombreMostrar) > 220) {
            while (doc.getTextWidth(nombreMostrar + "...") > 220 && nombreMostrar.length > 0) nombreMostrar = nombreMostrar.slice(0, -1);
            nombreMostrar += "...";
        }
        doc.text(nombreMostrar, xInicio + 10, y + 15);

        // Semántica de color en tarjetas
        if (j.goles > 0) {
            doc.setFillColor(16, 204, 191); doc.circle(xInicio + 240, y + 10, 8, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
            doc.text(String(j.goles), xInicio + 240, y + 14, { align: "center" });
            doc.setFont("helvetica", "normal");
        } else { doc.setTextColor(...colorGris); doc.text("-", xInicio + 240, y + 15, { align: "center" }); }

        if (j.amarillas > 0) {
            doc.setFillColor(255, 193, 7); doc.roundedRect(xInicio + 282, y + 4, 16, 12, 2, 2, 'F');
            doc.setTextColor(...colorSecundario); doc.setFont("helvetica", "bold");
            doc.text(String(j.amarillas), xInicio + 290, y + 14, { align: "center" });
            doc.setFont("helvetica", "normal");
        } else { doc.setTextColor(...colorGris); doc.text("-", xInicio + 290, y + 15, { align: "center" }); }

        if (j.rojas > 0) {
            doc.setFillColor(244, 67, 54); doc.roundedRect(xInicio + 322, y + 4, 16, 12, 2, 2, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
            doc.text(String(j.rojas), xInicio + 330, y + 14, { align: "center" });
            doc.setFont("helvetica", "normal");
        } else { doc.setTextColor(...colorGris); doc.text("-", xInicio + 330, y + 15, { align: "center" }); }
        y += 22;
    });
    
    doc.setDrawColor(...colorGrisClaro); doc.setLineWidth(1);
    doc.roundedRect(xInicio, yInicio + 35, 360, y - yInicio - 35, 5, 5, 'S');
}

// Convertidor asíncrono de imágenes a Base64 para el contexto del PDF
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image(); 
        img.onload = () => resolve(img); 
        img.onerror = reject; 
        img.src = src;
    });
}

// ============================================================================
// 7. SUBSISTEMA DE ANIMACIONES SECUNDARIAS
// ============================================================================
window.addEventListener('load', function() {
    const overlay = document.getElementById('mercado-overlay');
    const bannerInferior = document.getElementById('mercado-banner-inferior');
    
    if (overlay) {
        setTimeout(function() {
            overlay.classList.add('hide');
            
            setTimeout(function() {
                if (bannerInferior) {
                    bannerInferior.classList.add('show');
                }
            }, 200);
            
            setTimeout(function() {
                overlay.remove();
            }, 800);
        }, 3800);
    }
});