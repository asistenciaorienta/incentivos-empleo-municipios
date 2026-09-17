/*
 * Avisos del portal municipal · SAE Granada
 *
 * Este fichero NO contiene claves ni secretos y puede editarse directamente
 * en GitHub Pages.
 *
 * Para publicar un aviso:
 * - active: true
 * - id: identificador único
 * - version: incrementarlo si se modifica un aviso ya publicado; así volverá
 *   a mostrarse aunque el Ayuntamiento hubiera marcado "no volver a mostrar".
 * - level: "info", "warning" o "important"
 * - startDate / endDate: YYYY-MM-DD. endDate puede omitirse.
 * - municipalities: opcional. Si se indica, usar códigos de municipio.
 */

window.SAE_MUNICIPAL_NOTICES = [
  {
    id: "portal-municipal-nuevo-diseno-2026-08-13",
    version: 1,
    active: true,
    level: "info",
    startDate: "2026-08-13",
    endDate: "2026-09-30",
    title: "",
    message: "Acceso a sesiones, inscripciones, Anexos I e incidencias. Gestiona cada trámite desde su apartado."
  }
];
