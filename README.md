# Incentivos al empleo · Portal municipal v0.2

Portal estático para GitHub Pages conectado a Supabase.

## Novedades

- Inscripción nominal en sesiones iniciales.
- Validación de DNI y NIE.
- Cifrado híbrido en el navegador:
  - AES-256-GCM para el contenido.
  - RSA-OAEP con SHA-256 para la clave AES.
- Listado municipal con nombre e iniciales y documento enmascarado.
- Cancelación de inscripciones activas.
- Flujo preparado para sesiones finales.

## Seguridad

Los campos completos se convierten en un JSON y se cifran antes de llamar a Supabase. Se utiliza como `additionalData` de AES-GCM la cadena fija:

```text
incentivos-empleo.participant.v1
```

El servidor SAE tendrá que utilizar exactamente la misma cadena al descifrar.

GitHub contiene únicamente código, URL del proyecto, publishable key y clave pública RSA. No contiene la clave privada, secret key ni service_role.

## Instalación

1. Ejecutar `06_refuerzo_portal_cifrado.sql` en Supabase.
2. Sustituir en el repositorio los archivos `index.html`, `styles.css`, `app.js` y `README.md`.
3. Mantener el `config.js` que ya funciona.
4. Probar únicamente con datos ficticios hasta instalar la sincronización interna.

## Prueba recomendada

Usar un nombre ficticio y un documento de prueba estructuralmente válido, por ejemplo:

```text
Nombre: Persona
Primer apellido: Prueba
Segundo apellido: Uno
DNI: 00000000T
```

No utilizar datos reales todavía.
