# Incentivos al empleo · Portal municipal piloto v0.1

Portal estático para GitHub Pages conectado a Supabase.

## Alcance de esta versión

- Inicio de sesión con correo y contraseña.
- Consulta del perfil municipal vinculado.
- Consulta de sesiones publicadas.
- Resumen de sesiones iniciales y finales.
- Cierre de sesión.
- Sin nombres, apellidos, DNI ni inscripciones todavía.

## Archivos

- `index.html`: estructura del portal.
- `styles.css`: diseño adaptable y accesible.
- `app.js`: autenticación y consultas a Supabase.
- `config.js`: URL y clave pública del proyecto.
- `.nojekyll`: evita procesamiento de Jekyll en GitHub Pages.

## 1. Configurar Supabase

Abre `config.js` y sustituye:

```js
SUPABASE_URL: "PEGA_AQUI_LA_URL_DEL_PROYECTO",
SUPABASE_PUBLISHABLE_KEY: "PEGA_AQUI_LA_PUBLISHABLE_KEY"
```

Por los valores de tu proyecto.

Puedes usar:

- `Publishable key`, recomendada para nuevas claves.
- `anon key`, si el proyecto todavía utiliza las claves heredadas.

No introduzcas nunca en estos archivos:

- Secret key.
- `service_role`.
- Contraseña de PostgreSQL.
- Clave privada RSA.

## 2. Probar en Windows antes de publicar

Desde CMD, situado en la carpeta:

```cmd
py -m http.server 8080
```

Abre:

```text
http://localhost:8080
```

Entra con el usuario piloto creado en Supabase Auth.

Debe mostrar:

- AYUNTAMIENTO PILOTO.
- Sesión inicial de prueba.
- Sesión final de prueba.

Para detener el servidor pulsa `Ctrl + C`.

## 3. Publicar en GitHub Pages

Crea un repositorio, por ejemplo:

```text
incentivos-empleo-municipios
```

Desde la carpeta del proyecto:

```cmd
git init
git add .
git commit -m "Crea portal municipal piloto"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/incentivos-empleo-municipios.git
git push -u origin main
```

En GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
→ main / root
→ Save
```

## 4. Comprobaciones

1. Accede con el usuario municipal piloto.
2. Comprueba que aparece AYUNTAMIENTO PILOTO.
3. Comprueba las dos sesiones.
4. Cierra sesión.
5. Abre una ventana privada y comprueba que no se muestran datos sin iniciar sesión.

## Seguridad

La URL y la publishable key son valores públicos de cliente. La protección real la realizan:

- Supabase Auth.
- El JWT del usuario.
- Las políticas RLS ya instaladas.
- La vinculación del perfil a un ayuntamiento.

La secret key y `service_role` no deben aparecer nunca en GitHub.
