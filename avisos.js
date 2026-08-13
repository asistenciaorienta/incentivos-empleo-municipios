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
    title: "Nuevo acceso a sesiones, incidencias y Anexos I",
    message: "La gestión municipal se organiza en Sesiones grupales, Incidencias y Anexos I. En «Inscripción / Enlaces» puedes consultar las sesiones iniciales y finales, inscribir participantes, copiar el enlace de conexión y revisar las personas inscritas. Si aparece algún elemento pendiente, consulta el apartado «Incidencias»."
  }
];
