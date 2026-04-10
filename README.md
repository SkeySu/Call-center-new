# Call Center Médico

Sistema Fullstack para la gestión de un call center médico con importación masiva de pacientes, asignación de agentes y registro de llamadas.

## Estructura del proyecto

- `backend/` : servidor Express + Supabase, APIs de autenticación, pacientes, asignaciones e interacciones.
- `frontend/` : aplicación Next.js App Router, panel de control, importación, asignación, registros asignados y gestión de usuarios.

## Qué incluye

- Autenticación con JWT y roles `ADMIN` / `AGENT`.
- Carga masiva de pacientes desde CSV/Excel con normalización de campos.
- Guardado de pacientes en Supabase con `medical_data` dinámico.
- Listado de pacientes por lista de importación.
- Asignación de pacientes a agentes individual y masiva.
- Dashboard de agente con sus pacientes asignados.
- Registro de llamadas con número de llamada y estado.
- Sección administrativa para ver todas las asignaciones y crear usuarios.

## Requisitos

- Node.js 18+ o superior
- npm 10+ o superior
- Base de datos Postgres / Supabase configurada

## Instalación

1. Clona el repositorio completo desde la raíz del proyecto:

```bash
cd c:\Users\User\Desktop\call-center-project
```

2. Instala dependencias del backend:

```bash
cd backend
npm install
```

3. Instala dependencias del frontend:

```bash
cd ../frontend
npm install
```

## Configuración

### Backend

Crea un archivo `.env` en `backend/` con variables similares a:

```env
SUPABASE_URL=https://tu-supabase-url
SUPABASE_KEY=tu-supabase-key
JWT_SECRET=tu_secreto_jwt
```

Asegúrate de que tu base de datos Supabase contenga las tablas del script `backend/src/config/script-db.sql`.

### Frontend

Crea un archivo `.env.local` en `frontend/` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Ejecución

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Después abre `http://localhost:3000`.

## Endpoints principales

### Autenticación
- `POST /api/auth/register` : registrar usuario
- `POST /api/auth/login` : iniciar sesión

### Pacientes y asignaciones
- `POST /api/patients/bulk` : cargar pacientes masivamente
- `GET /api/patients` : listar pacientes
- `GET /api/patients/lists` : listar importaciones
- `GET /api/patients/agents` : listar agentes
- `POST /api/patients/assign-many` : asignar varios pacientes
- `POST /api/patients/:id/call` : registrar llamada
- `GET /api/patients/:id/interactions` : ver interacciones

### Usuarios
- `GET /api/auth/users` : listar usuarios (admin)
- `POST /api/auth/users` : crear usuario (admin)
- `PUT /api/auth/users/:id/password` : cambiar contraseña

## Uso general

1. Registra un usuario y haz login.
2. Importa pacientes desde CSV/Excel en `Dashboard > Importar pacientes`.
3. Asigna los pacientes por lista a agentes en `Dashboard > Asignar`.
4. Los agentes pueden ver sus pacientes en `Dashboard > Mis asignaciones` y registrar llamadas.
5. El administrador puede ver todas las asignaciones y crear usuarios.

## Notas importantes

- Las llamadas se guardan con `call_number` y `status`.
- Los campos de contacto adicionales se guardan en `medical_data`.
- El sistema usa roles para ocultar y proteger rutas de administración.

## Recomendaciones

- Revisa `backend/src/config/script-db.sql` antes de crear la base de datos.
- Mantén separados los envs de desarrollo y producción.
- Si cambias el repo remoto, recuerda actualizar `git remote` y empujar desde la raíz del proyecto.
