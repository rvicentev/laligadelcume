# LALIGA DEL CUMe

Este es un proyecto personal creado para gestionar y visualizar los datos de una liga de fútbol sala. Está dividido en dos partes principales: una **vista pública** (para que los jugadores y el público en general consulte resultados, calendarios y estadísticas) y una **intranet para árbitros** (donde se gestionan los partidos en directo y se generan las actas).


## Características principales

* **Clasificación y Estadísticas:** Pichichis, equipos menos goleados y evolución de puntos generados dinámicamente extrayendo datos de Google Sheets (CSV).
* **Gráficos interactivos:** Visualización del rendimiento de los equipos mediante `Chart.js`.
* **Calendario:** Vista interactiva con filtrado por jornadas, visualización de enfrentamientos y control de fases (mercado de fichajes, Final Four, etc.).
* **Portal de Árbitros (Intranet):**
  * Acceso protegido por contraseña (verificada contra hash en Supabase).
  * Cronómetro de partido en vivo.
  * Gestión de eventos (goles, tarjetas, faltas, convocatorias).
  * **Generación de Actas:** Creación automática del acta del partido en formato PDF utilizando `jsPDF` y almacenamiento de una copia de seguridad en Excel (`SheetJS`) subida directamente a un bucket de `Supabase`.

## Tecnologías utilizadas

El proyecto está construido de forma sencilla y sin frameworks pesados, ideal para alojarse en servicios estáticos como GitHub Pages, Firebase Hosting o Vercel:

* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Base de datos y Storage:** [Supabase](https://supabase.com/) (para subida de actas y login de árbitros).
* **Fuente de datos pública:** Google Sheets (publicado como CSV para lectura rápida).
* **Librerías externas:**
  * `Chart.js` (Gráficos)
  * `SheetJS / xlsx` (Lectura y escritura de plantillas Excel)
  * `jsPDF` (Generación de las actas en PDF)
  * `bcryptjs` (Comprobación de contraseñas en cliente)

## Cómo probarlo en local

Como el proyecto es estático, no necesitas levantar un servidor local complejo (como Node o Python) para ver la interfaz básica.

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/rvicentev/laligadelcume](https://github.com/rvicentev/laligadelcume)
   ```
2. Abre el archivo `index.html` en tu navegador.
3. **Aviso importante:** Para que las funciones de estadísticas, calendario y el portal de árbitros funcionen completamente, tendrás que sustituir los *placeholders* en los archivos `.js` por tus propias URLs de Google Sheets y tus credenciales de Supabase.
   * Busca los textos `TU_URL_CSV_...` y `TU_SUPABASE_...` en la carpeta `scripts/` y cámbialos por tus datos reales.

## Estructura del proyecto

* `/` - Páginas principales (index.html, calendario.html, equipos.html, estadisticas.html, actas.html).
* `/styles` - Hojas de estilo CSS organizadas por componentes.
* `/scripts` - Lógica principal en JavaScript (controladores de vista y conexión a base de datos).
* `/images` - Logotipos, iconos y escudos de los equipos (versión plantilla/placeholder).
* `/excels` - Plantillas base utilizadas por la librería SheetJS para la generación de las actas.

---
**Aviso Legal (Disclaimer):** Este es un proyecto de código abierto con fines estrictamente personales, lúdicos y educativos, totalmente sin ánimo de lucro. Cualquier similitud, referencia o uso de terminología que pueda asemejarse a empresas, competiciones profesionales o marcas registradas reales es puramente coincidencia o se utiliza en un contexto de parodia/homenaje entre amigos. Este proyecto no busca fama, notoriedad, ni tiene ninguna afiliación oficial con dichas entidades, no existiendo ninguna intención de infringir derechos de autor ni obtener beneficio económico. Todos los derechos sobre marcas comerciales reales pertenecen a sus respectivos propietarios legales.
