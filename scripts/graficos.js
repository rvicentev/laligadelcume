/**
 * @fileoverview Motor de renderizado de gráficos estadísticos usando Chart.js
 * Extrae, procesa y visualiza los datos de rendimiento de los equipos.
 */

// Estructura global de estado para los gráficos
let datosJornadas = {
    equipos: [],
    puntosAcumulados: [],
    goles: {
        aFavor: [],
        enContra: []
    },
    goleadores: []
};

// Diccionario de colores corporativos por equipo (Sustituir por nombres reales)
const coloresEquipos = {
    "EQUIPO ALPHA": "#158000",
    "EQUIPO BRAVO": "#244228",
    "EQUIPO CHARLIE": "#931400",
    "EQUIPO DELTA": "#4a90e2",
    "EQUIPO ECHO": "#2c2c2c",
    "EQUIPO FOXTROT": "#0058cb",
    "EQUIPO GOLF": "#e7ad1b"
};

// ==========================================
// 1. CARGA Y PROCESAMIENTO DE DATOS
// ==========================================

async function cargarDatosReales() {
    try {
        // [CIBERSEGURIDAD] Sustituir por las URLs públicas exportadas como CSV
        const SHEET_URL = "TU_URL_CLASIFICACION_CSV";
        
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error("Error HTTP en Clasificación");
        
        const data = await response.text();
        const rows = data.split("\n").slice(1).filter(row => row.trim());

        // Reset de estado
        datosJornadas.equipos = [];
        datosJornadas.goles.aFavor = [];
        datosJornadas.goles.enContra = [];

        // Parseo de la clasificación
        rows.forEach(row => {
            const cols = row.split(",").map(col => col.trim());
            if (cols.length >= 10) {
                const equipo = cols[1];
                const gf = parseInt(cols[7]) || 0;
                const gc = parseInt(cols[8]) || 0;

                datosJornadas.equipos.push(equipo);
                datosJornadas.goles.aFavor.push(gf);
                datosJornadas.goles.enContra.push(gc);
            }
        });

        await cargarHistoricoJornadas();
        await cargarGoleadores();

        return true;
    } catch (error) {
        console.error('Error procesando datos de la liga:', error);
        return false;
    }
}

async function cargarHistoricoJornadas() {
    try {
        // [CIBERSEGURIDAD] Sustituir por URL del Histórico
        const HISTORICO_URL = "TU_URL_HISTORICO_CSV";

        const response = await fetch(HISTORICO_URL);
        if (!response.ok) throw new Error("Error HTTP en Histórico");

        const data = await response.text();
        const rows = data.split("\n").filter(row => row.trim());

        datosJornadas.puntosAcumulados = datosJornadas.equipos.map(() => []);

        // Procesamiento fila a fila omitiendo la cabecera
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row.trim()) continue;

            const cols = row.split(",").map(col => col.trim());
            let equipoHistorico = cols[0];

            // Normalización de caracteres UTF-8 provenientes del CSV crudo
            equipoHistorico = equipoHistorico
                .replace(/Ã"N/g, 'ÓN')
                .replace(/Ã'N/g, 'ÓN')
                .replace(/Ã³/g, 'ó')
                .replace(/Ã±/g, 'ñ')
                .replace(/Ã©/g, 'é')
                .replace(/Ã¡/g, 'á')
                .replace(/Ã­/g, 'í')
                .replace(/Ãº/g, 'ú');

            const indexEquipo = datosJornadas.equipos.findIndex(e =>
                e.toUpperCase().trim() === equipoHistorico.toUpperCase().trim()
            );

            if (indexEquipo !== -1) {
                const puntosPorJornada = [0]; // Baseline inicial

                for (let j = 1; j < cols.length; j++) {
                    puntosPorJornada.push(parseInt(cols[j]) || 0);
                }
                datosJornadas.puntosAcumulados[indexEquipo] = puntosPorJornada;
            }
        }

        // Prevención de errores para equipos sin histórico registrado
        datosJornadas.equipos.forEach((equipo, index) => {
            if (!datosJornadas.puntosAcumulados[index] || datosJornadas.puntosAcumulados[index].length === 0) {
                datosJornadas.puntosAcumulados[index] = [0];
            }
        });

    } catch (error) {
        console.error('Fallo en la carga del histórico:', error);
        datosJornadas.puntosAcumulados = datosJornadas.equipos.map(() => [0]); // Fallback
    }
}

async function cargarGoleadores() {
    // Array estático de *fallback*. En producción se puede conectar a la hoja de Goleadores.
    datosJornadas.goleadores = [
        { nombre: "Jugador Uno", equipo: "EQUIPO ALPHA", goles: 12 },
        { nombre: "Jugador Dos", equipo: "EQUIPO BRAVO", goles: 10 },
        { nombre: "Jugador Tres", equipo: "EQUIPO CHARLIE", goles: 9 },
        { nombre: "Jugador Cuatro", equipo: "EQUIPO DELTA", goles: 8 },
        { nombre: "Jugador Cinco", equipo: "EQUIPO ECHO", goles: 7 }
    ];
}

// ==========================================
// 2. MOTORES DE RENDERIZADO DE GRÁFICOS
// ==========================================

function crearGraficoEvolucion() {
    const ctx = document.getElementById('graficoEvolucion');
    if (!ctx) return;

    const responsive = obtenerOpcionesResponsive();
    const jornadaMax = Math.max(...datosJornadas.puntosAcumulados.map(arr => arr.length));
    const labels = ['Inicio'];
    
    for (let i = 1; i < jornadaMax; i++) {
        labels.push(`J${i}`);
    }

    const datasets = datosJornadas.equipos.map((equipo, index) => ({
        label: equipo,
        data: datosJornadas.puntosAcumulados[index],
        borderColor: coloresEquipos[equipo] || '#666666',
        backgroundColor: (coloresEquipos[equipo] || '#666666') + '20',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false
    }));

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'EVOLUCIÓN DE PUNTOS POR JORNADA',
                    font: { size: responsive.titleSize, family: 'Righteous' },
                    color: '#2c2c2c'
                },
                legend: {
                    display: responsive.displayLegend,
                    position: responsive.legendPosition,
                    labels: {
                        font: { size: responsive.legendSize, family: 'Righteous' },
                        padding: responsive.legendPadding,
                        boxWidth: esMobil() ? 12 : 15,
                        boxHeight: esMobil() ? 12 : 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: responsive.tooltipSize + 2 },
                    bodyFont: { size: responsive.tooltipSize },
                    padding: esMobil() ? 8 : 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'PUNTOS',
                        font: { size: responsive.axisSize, family: 'Righteous' }
                    },
                    ticks: { stepSize: 3, font: { size: responsive.axisSize - 2 } }
                },
                x: {
                    title: {
                        display: !esMobil(),
                        text: 'JORNADAS',
                        font: { size: responsive.axisSize, family: 'Righteous' }
                    },
                    ticks: { font: { size: responsive.axisSize - 2 } }
                }
            }
        }
    });
}

function crearGraficoGoles() {
    const canvas = document.getElementById('graficoGoles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datosJornadas.equipos.map(e => e.length > 15 ? e.substring(0, 12) + '...' : e),
            datasets: [
                {
                    label: 'GOLES A FAVOR',
                    data: datosJornadas.goles.aFavor,
                    backgroundColor: '#10ccbb',
                    borderColor: '#0db3a4',
                    borderWidth: 2
                },
                {
                    label: 'GOLES EN CONTRA',
                    data: datosJornadas.goles.enContra,
                    backgroundColor: '#e63946',
                    borderColor: '#d62839',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'GOLES A FAVOR vs EN CONTRA',
                    font: { size: 20, family: 'Righteous' },
                    color: '#2c2c2c'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 12, family: 'Righteous' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'GOLES', font: { size: 14, family: 'Righteous' } }
                }
            }
        }
    });
}

function crearGraficoGoleadores() {
    const canvas = document.getElementById('graficoGoleadores');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const topGoleadores = [...datosJornadas.goleadores].sort((a, b) => b.goles - a.goles);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topGoleadores.map(g => g.nombre),
            datasets: [{
                label: 'GOLES',
                data: topGoleadores.map(g => g.goles),
                backgroundColor: topGoleadores.map(g => coloresEquipos[g.equipo]),
                borderColor: topGoleadores.map(g => coloresEquipos[g.equipo]),
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'TOP 5 GOLEADORES',
                    font: { size: 20, family: 'Righteous' },
                    color: '#2c2c2c'
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const jugador = topGoleadores[context.dataIndex];
                            return `${jugador.equipo}: ${jugador.goles} goles`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'GOLES', font: { size: 14, family: 'Righteous' } }
                }
            }
        }
    });
}

function crearGraficoDiferencia() {
    const canvas = document.getElementById('graficoDiferencia');
    if (!canvas) return;

    const golesAFavor = datosJornadas.goles.aFavor;

    new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: datosJornadas.equipos.map(e => e.length > 20 ? e.substring(0, 17) + '...' : e),
            datasets: [{
                label: 'Goles a Favor',
                data: golesAFavor,
                backgroundColor: datosJornadas.equipos.map(e => coloresEquipos[e]),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'DISTRIBUCIÓN DE GOLES MARCADOS',
                    font: { size: 20, family: 'Righteous' },
                    color: '#2c2c2c',
                    padding: 20
                },
                legend: {
                    position: 'right',
                    labels: { font: { size: 11, family: 'Righteous' }, padding: 10, boxWidth: 15, boxHeight: 15 }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, family: 'Righteous' },
                    bodyFont: { size: 12 },
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            const total = golesAFavor.reduce((a, b) => a + b, 0);
                            const porcentaje = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.parsed} goles (${porcentaje}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ==========================================
// 3. INICIALIZADOR Y UTILIDADES RESPONSIVAS
// ==========================================

async function inicializarGraficos() {
    if (typeof Chart === 'undefined') {
        console.error('El motor de gráficos (Chart.js) no está disponible en el DOM.');
        return;
    }

    const datosOk = await cargarDatosReales();
    if (!datosOk) return;

    try {
        crearGraficoEvolucion();
        crearGraficoGoles();
        crearGraficoGoleadores();
        crearGraficoDiferencia();
    } catch (error) {
        console.error('Excepción generada durante el renderizado de gráficos:', error);
    }
}

function esMobil() {
    return window.innerWidth <= 768;
}

function obtenerOpcionesResponsive() {
    const isMobile = esMobil();
    return {
        titleSize: isMobile ? 16 : 20,
        legendSize: isMobile ? 10 : 12,
        legendPadding: isMobile ? 10 : 15,
        axisSize: isMobile ? 11 : 14,
        tooltipSize: isMobile ? 11 : 12,
        legendPosition: 'bottom',
        displayLegend: true
    };
}

document.addEventListener('DOMContentLoaded', inicializarGraficos);