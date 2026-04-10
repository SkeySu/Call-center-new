# Call Center Médico - Iteraciones

Este repositorio contiene un sistema Fullstack para la importación de pacientes y gestión de un call center médico.

## Iteración 1 - Autenticación y Backend Inicial
- Configuración de backend con Express y Supabase.
- Definición de la conexión Supabase en `backend/src/config/db.js`.
- Modelo `users` en Supabase y controladores de autenticación en `backend/src/controllers/authController.js`.
- Rutas de login y registro en `backend/src/routes/authRoutes.js`.
- Middleware JWT en `backend/src/middlewares/authMiddleware.js`.
- Ruta protegida de pacientes pendiente para la carga masiva.

## Iteración 2 - Importación Masiva y Frontend Dashboard
- Implementación de carga masiva de pacientes con `POST /api/patients/bulk`.
- Normalización de filas Excel/CSV y mapeo inteligente de campos clave en `backend/src/controllers/patientController.js`.
- Almacenamiento de información dinámica en `medical_data` JSONB.
- Página de importación en `frontend/app/dashboard/import/page.tsx`.
- Parsing de archivos con PapaParse y vista previa de datos antes del envío.
- Autenticación de frontend con `frontend/src/api.ts` y protección de rutas en `frontend/app/dashboard/layout.tsx`.

## Iteración 3 - Listado de Pacientes y Asignación de Agentes
- Nuevo endpoint `GET /api/patients` para listar pacientes importados.
- Nuevo endpoint `POST /api/patients/:id/assign` para asignar un paciente al agente autenticado.
- Modelo actualizado en `backend/src/models/patientModel.js`.
- Página de pacientes en `frontend/app/dashboard/patients/page.tsx`.
- Navegación en el dashboard hacia `Asignar`.

## Iteración 4 - Importación por listas y asignación masiva
- Creación de registros de lista de importación en `backend/src/models/patientListModel.js`.
- Guardado de `list_id` en cada paciente importado para separar por lista.
- Endpoint `GET /api/patients/lists` para obtener las listas de importación.
- Endpoint `GET /api/patients/agents` para cargar agentes disponibles.
- Endpoint `POST /api/patients/assign-many` para asignar varios pacientes a un agente.
- Vista de asignación mejorada en `frontend/app/dashboard/patients/page.tsx` con selección de lista, agente y selección masiva.
- La sección de navegación cambió de `Pacientes` a `Asignar`.

## Cómo correr el proyecto

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Rutas principales
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/patients/bulk`
- `GET /api/patients`
- `POST /api/patients/:id/assign`

## Siguientes pasos sugeridos
- Agregar estado de asignación y filtro por agente.
- Agregar métricas de llamadas e interacciones.
- Crear listado de usuarios/agentes y permisos más finos.
