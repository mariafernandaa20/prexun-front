# Guía de Migración: Autenticación de Google al Backend

Actualmente, la integración con Google Contacts ocurre en el **frontend** cada vez que un usuario intenta guardar un estudiante. Esto obliga a iniciar sesión con Google en cada dispositivo o cada vez que el token expira localmente.

El objetivo de esta migración es trasladar esa responsabilidad al **backend**. De esta forma, el administrador sólo deberá vincular la cuenta de Google (para un **Plantel** específico) una vez. Posteriormente, cualquier usuario o dispositivo que administre ese plantel aprovechará la sesión persistente en el servidor para sincronizar los contactos automáticamente.

A continuación se detallan los pasos para retomar este trabajo:

---

## 1. Cambios requeridos en el Backend (Base de Datos)

El token de Google debe estar asociado al **Plantel**. Cuando un admin autoriza a la aplicación, Google emite un `refresh_token` de larga duración.
- **Base de Datos:** Añadir campos en la tabla de `planteles` (o en una tabla separada `plantel_google_sessions` si se prefieren relaciones 1:1). 
  - `google_refresh_token` (string, nullable)
  - `google_access_token` (string, nullable)
  - `google_token_expires_at` (timestamp, nullable)
  - `google_account_email` (string, opcional, para mostrar qué cuenta está vinculada)

## 2. Cambios requeridos en el Backend (API & OAuth2)

Para poder mantener la sesión abierta permanentemente en el servidor, necesitas implementar el flujo estándar OAuth2 ("Authorization Code Flow") con Google.
1. **Endpoint GET `/api/google/auth-url?plantel_id={id}`**
   - Este endpoint generará la URL de autorización de Google.
   - **Crucial:** Debe incluir los parámetros `access_type=offline` y `prompt=consent` para asegurar que Google devuelva un `refresh_token`. El `state` debería incluir el `plantel_id` cifrado o en JWT para saber a qué plantel vincularlo tras el callback.
2. **Endpoint GET `/api/google/callback`**
   - Recibe el `code` de autorización de Google.
   - Intercambia este `code` por un `access_token` y un `refresh_token`.
   - Guarda los tokens en la base de datos asociados al `plantel_id` provisto en el parámetro `state`.
   - Redirige de vuelta al frontend (ej: `/planteles/estudiantes`).
3. **Servicio o Middleware de Google API**
   - Crear una función `getGoogleClient(plantel_id)` que revise en la base de datos si el `access_token` ha expirado. Si expiró, usar el `google_refresh_token` para obtener uno nuevo y actualizarlo en la DB antes de instanciar el cliente de la API (People API) de Google.

## 3. Cambios en la creación de Estudiantes (Backend)

Revisa el método del backend que guarda al estudiante cuando se envía el formulario desde el frontend.
- **Antes (Actual):** El backend guarda en DB y responde con éxito. El frontend luego hace la llamada a Google API.
- **Nuevo flujo:** 
  1. El backend guarda al estudiante en la DB.
  2. El backend verifica si el `campus_id` recibido tiene un `google_refresh_token` válido.
  3. Si es así, usa el servicio creado en el paso anterior (`getGoogleClient(campus_id)`) para crear el contacto en Google Accounts nativamente desde el servidor.
  4. Retorna éxito al frontend.

## 4. Cambios requeridos en el Frontend (`student-form.tsx`)

Una vez que el backend se hace cargo:
- **Remover la importación y lógica de Google Auth** del archivo:
  ```typescript
  // ELIMINAR ESTO:
  import { addContactToGoogle } from '@/lib/googleContacts';
  // ...
  await addContactToGoogle(accessToken, {...});
  ```
- El formulario ya no necesitará conocer si hay sesión o no de Google; su única tarea será llamar al API del backend para guardar al estudiante.

## 5. Cambios requeridos en el Frontend (`GoogleAuth.tsx` y Layout)

El archivo en `app/(protected)/planteles/google/GoogleAuth.tsx` deberá ser refactorizado por completo. Ya no cargará el SDK de JavaScript de Google localmente.
- **Consulta de Estado:** Debería consultar al backend en su montaje: *"Para el activo {activeCampus.id}, ¿hay una sesión de Google vinculada?"*
- **Si no está vinculada:** Mostrar botón *"Vincular Google Contacts"*. Al hacer clic, redirigir el navegador hacia la URL del backend del paso 2 (`/api/google/auth-url?plantel_id={activeCampus.id}`).
- **Si está vinculada:** Mostrar un estado verde *"✅ Google vinculado - Todas las sincronizaciones ocurren automáticamente"*, y opcionalmente un botón *"Desvincular"* que llame a un endpoint del backend para poner los tokens de la BD en `null`.

---

## 🚀 Resumen para empezar mañana:
1. Ir al backend y agregar las columnas `refresh_token` en la tabla de planteles.
2. Crear un controlador de Google (`/google/auth` y `/google/callback`) usando la librería oficial de Google para el backend (ej. `google-auth-library` de Node.js, o el equivalente si usas Laravel/PHP o Python).
3. Modificar el endpoint actual donde se crea el estudiante backend para que envíe el contacto a Google usando los tokens guardados.
4. Limpiar `student-form.tsx` en el frontend, quitando la lógica de Google API local.
5. Modificar `GoogleAuth.tsx` para que solo inicie un redireccionamiento OAuth2 en lugar de retener un token en el LocalStorage.
