/**
 * @fileoverview Lógica para la generación dinámica de Actas de Partido en Excel.
 * Consume una plantilla base y un Excel de base de datos de equipos.
 * @requires xlsx (Librería SheetJS)
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Rutas relativas a los archivos fuente. Asegurarse de que el servidor permita peticiones estáticas a este directorio.
    const plantillaPath = "excels/plantilla_Acta.xlsx";
    const equiposPath = "excels/equipos_actas.xlsx";

    let equiposData = {};

    // 1. Carga y parseo de la base de datos de equipos en memoria
    try {
        const responseEquipos = await fetch(equiposPath);
        if (!responseEquipos.ok) throw new Error(`HTTP error! status: ${responseEquipos.status}`);
        
        const arrayBufferEquipos = await responseEquipos.arrayBuffer();
        const workbookEquipos = XLSX.read(arrayBufferEquipos, { type: "array" });

        // Mapeamos cada hoja (Sheet) como un equipo distinto
        workbookEquipos.SheetNames.forEach(sheetName => {
            const sheet = workbookEquipos.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
            equiposData[sheetName] = data;
        });
    } catch (err) {
        console.error("Error cargando base de datos de equipos:", err);
        alert("Fallo de conexión al cargar los equipos. Verifica la ruta o el estado del servidor.");
        return; // Interrumpimos la ejecución si no hay datos base
    }

    // 2. Carga del buffer de la plantilla oficial del acta
    let workbookPlantilla;
    try {
        const responsePlantilla = await fetch(plantillaPath);
        if (!responsePlantilla.ok) throw new Error(`HTTP error! status: ${responsePlantilla.status}`);
        
        const arrayBufferPlantilla = await responsePlantilla.arrayBuffer();
        workbookPlantilla = XLSX.read(arrayBufferPlantilla, { type: "array" });
    } catch (err) {
        console.error("Error cargando plantilla del acta:", err);
        alert("Fallo al obtener la plantilla base. Verifica la ruta o el estado del servidor.");
        return;
    }

    // 3. Poblado dinámico del DOM (Selectores de Equipos)
    const selectLocal = document.getElementById("equipoLocal");
    const selectVisitante = document.getElementById("equipoVisitante");
    
    // Reseteamos el estado inicial de los selectores
    selectLocal.innerHTML = '<option value="">Selecciona un equipo</option>';
    selectVisitante.innerHTML = '<option value="">Selecciona un equipo</option>';

    Object.keys(equiposData).forEach(team => {
        const optionLocal = document.createElement("option");
        optionLocal.value = team;
        optionLocal.textContent = team;
        selectLocal.appendChild(optionLocal);

        const optionVisitante = document.createElement("option");
        optionVisitante.value = team;
        optionVisitante.textContent = team;
        selectVisitante.appendChild(optionVisitante);
    });

    // 4. Controlador de eventos para la generación y descarga del acta
    document.getElementById("generarActa").addEventListener("click", () => {
        const equipoLocal = selectLocal.value;
        const equipoVisitante = selectVisitante.value;
        const arbitro = document.getElementById("arbitro").value;
        const hora = document.getElementById("hora").value;

        // Validaciones básicas de integridad
        if (!equipoLocal || !equipoVisitante) {
            alert("Error: Es obligatorio seleccionar un equipo local y uno visitante.");
            return;
        }

        if (equipoLocal === equipoVisitante) {
            alert("Error de lógica: El equipo local y visitante no pueden ser el mismo.");
            return;
        }

        // Convertimos la hoja de la plantilla en un array bidimensional para facilitar la manipulación
        const actaSheet = XLSX.utils.sheet_to_json(workbookPlantilla.Sheets["ACTA"], { header: 1, raw: false, defval: "" });

        // --- Inyección de Metadatos del Partido ---
        actaSheet[1][2] = equipoLocal;       // Mapeado a rango fusionado C2:H2
        actaSheet[2][2] = equipoVisitante;   // Mapeado a rango fusionado C3:H3
        actaSheet[2][12] = arbitro;          // Mapeado a rango fusionado M3:S3
        actaSheet[2][19] = hora;             // Mapeado a rango fusionado T3:V4

        // --- Inyección de Plantilla Local ---
        // Se asume que los jugadores empiezan en la fila 5 (índice 4) del excel de base de datos
        const jugadoresLocal = equiposData[equipoLocal].slice(4, 15); 
        jugadoresLocal.forEach((row, idx) => {
            if(row[1]) { // Solo procesamos si hay nombre de jugador
                actaSheet[6 + idx][0] = row[0];  // Foto de jugador (Rango A7:A21)
                actaSheet[6 + idx][1] = row[1];  // Nombre de jugador (Rango fusionado B7:C21)
                actaSheet[6 + idx][2] = row[1];  // Duplicado necesario por cómo SheetJS maneja celdas fusionadas
            }
        });

        // --- Inyección de Plantilla Visitante ---
        const jugadoresVisitante = equiposData[equipoVisitante].slice(4, 15);
        jugadoresVisitante.forEach((row, idx) => {
            if(row[1]) {
                actaSheet[6 + idx][11] = row[0]; // Foto de jugador (Rango L7:L21)
                actaSheet[6 + idx][12] = row[1]; // Nombre de jugador (Rango fusionado M7:Q21)
                actaSheet[6 + idx][13] = row[1];
                actaSheet[6 + idx][14] = row[1];
                actaSheet[6 + idx][15] = row[1];
                actaSheet[6 + idx][16] = row[1];
            }
        });

        // --- Inyección de Escudos ---
        // Se asume que la URL/ruta del escudo está en la celda A1 (0,0) del excel del equipo
        actaSheet[21][4] = equiposData[equipoLocal][0][0];       // Mapeado a E22:G23
        actaSheet[21][20] = equiposData[equipoVisitante][0][0];  // Mapeado a U22:V23

        // --- Reconstrucción del archivo y Descarga ---
        // Volvemos a convertir el array manipulado en una hoja compatible con SheetJS
        const newSheet = XLSX.utils.aoa_to_sheet(actaSheet);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, "ACTA");

        // Dispara la descarga en el navegador del cliente
        XLSX.writeFile(newWorkbook, `Acta_${equipoLocal}_vs_${equipoVisitante}.xlsx`);
    });
});