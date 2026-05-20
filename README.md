# Call Center Médico

Sistema Fullstack Premium para la gestión de un call center médico con importación masiva de pacientes, asignación y reasignación inteligente de agentes, panel analítico en tiempo real y generación automatizada de reportes en Excel y PDF.

---

## 🚀 Características Principales

El proyecto ha sido actualizado con características avanzadas para optimizar la gestión y analítica de datos:

*   **Autenticación y Roles Estrictos**: Inicio de sesión y registro seguros con JSON Web Tokens (JWT) y separación de roles (`ADMIN` y `AGENT`).
*   **Carga Masiva Inteligente**: Importación de pacientes desde archivos **CSV** o **Excel** con normalización automática de nombres (primer nombre, apellido, nombres completos) y almacenamiento dinámico de columnas personalizadas en una estructura flexible `medical_data` (JSONB) en Supabase.
*   **Asignación y Reasignación Dinámica**:
    *   Asignación individual o por lotes de pacientes libres a agentes.
    *   **Motor de Reasignación**: Permite reasignar registros activos de un agente a otro, filtrando por lista de importación, cantidad de registros o agentes específicos.
*   **Panel Analítico Interactivo (Dashboard)**:
    *   Resumen visual del estado de las llamadas en tiempo real.
    *   Gráficos dinámicos e interactivos construidos con **Recharts**:
        *   *Gráfico de Anillo (Pie Chart)*: Distribución de llamadas según su estado actual (Novedades, Conectado, Sin respuesta, etc.).
        *   *Gráfico de Barras (Bar Chart)*: Rendimiento de llamadas registradas por cada agente.
*   **Generador y Exportador de Reportes**:
    *   **Exportación a Excel (.xlsx)**: Generación automática de hojas de cálculo detalladas con el historial de llamadas de interacciones a través de la librería `xlsx`.
    *   **Exportación a PDF (.pdf)**: Generación instantánea de reportes ejecutivos limpios con tablas autoestructuradas usando `jspdf` y `jspdf-autotable`.
*   **Soporte Docker Multi-Contenedor**: Ecosistema completo pre-configurado para empaquetar y levantar tanto el backend como el frontend en segundos.

---

## 📂 Estructura del Proyecto

El proyecto está dividido en dos partes principales y un orquestador:

*   **`backend/`** : Servidor Node.js + Express.js, cliente de Supabase, controladores de negocio, middlewares de autenticación, definición de modelos y enrutamiento.
*   **`frontend/`** : Aplicación moderna con Next.js (App Router) y React. Incluye diseño premium con Tailwind CSS (o estilos personalizados), gráficos interactivos y formularios optimizados.
*   **`docker-compose.yml`** : Configuración de servicios e integración de red para levantar la infraestructura unificada.

---

## 🛠️ Requisitos del Sistema

*   **Node.js**: v18.0.0 o superior.
*   **npm**: v10.0.0 o superior.
*   **Supabase/PostgreSQL**: Instancia activa con las tablas del esquema configuradas.
*   **Docker & Docker Compose** (Opcional, para ejecución rápida en contenedores).

---

## 💻 Configuración de Entornos

### 1. Backend (`backend/.env`)

Crea un archivo `.env` en la raíz del directorio `/backend`:

```env
PORT=4000
SUPABASE_URL=https://tu-proyecto-supabase.supabase.co
SUPABASE_KEY=tu-anon-key-de-supabase
JWT_SECRET=tu-secreto-jwt-altamente-seguro
```

> [!NOTE]
> Asegúrate de que tu base de datos Supabase contenga las tablas del script en PDF o de los modelos (`users`, `patients`, `patient_lists`, `assignments`, `interactions`).

### 2. Frontend (`frontend/.env.local`)

Crea un archivo `.env.local` en la raíz del directorio `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🐳 Ejecución con Docker (Recomendado)

Si deseas levantar todo el ecosistema de forma unificada sin necesidad de instalar dependencias de forma local, ejecuta en la raíz del repositorio:

```bash
docker compose up --build
```

Esto compilará los contenedores y levantará:
*   **Backend** en: `http://localhost:4000`
*   **Frontend** en: `http://localhost:3000`

---

## 📦 Ejecución Local de Desarrollo

### 1. Preparar e iniciar el Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Preparar e iniciar el Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Una vez iniciados ambos servicios, abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔗 Endpoints de la API (Backend)

Todos los endpoints están protegidos por el middleware de autenticación (JWT), a excepción de la autenticación de usuarios.

### 🔐 Autenticación y Usuarios
*   `POST /api/auth/register` : Registrar un nuevo usuario.
*   `POST /api/auth/login` : Iniciar sesión. Retorna el token JWT y datos del usuario.
*   `GET /api/auth/users` : Obtener listado de usuarios registrados en el sistema.
*   `POST /api/auth/users` : Crear usuario desde el panel administrativo (`ADMIN`).
*   `PUT /api/auth/users/:id/password` : Modificar la contraseña de un usuario (`ADMIN` o propio).

### 👥 Gestión de Pacientes
*   `GET /api/patients` : Obtener pacientes registrados. Soporta filtros:
    *   `limit`: Cantidad de registros (defecto: 200).
    *   `offset`: Desplazamiento para paginación.
    *   `listId`: Filtrar por lista de importación específica.
    *   `onlyUnassigned`: Filtrar solo pacientes no asignados (defecto: true).
*   `GET /api/patients/lists` : Listar todas las cargas masivas o archivos importados (`patient_lists`).
*   `GET /api/patients/agents` : Listar usuarios con rol de agente (`AGENT` o `ADMIN`) disponibles para asignación.
*   `POST /api/patients/bulk` : Subida de lote de pacientes. Recibe un JSON de registros normalizados y un `file_name`.

### 📋 Asignación y Reasignación
*   `GET /api/patients/assigned` : Listar los pacientes activos asignados al agente autenticado en sesión.
*   `GET /api/patients/assignments` : Listar todas las asignaciones activas en el sistema (`ADMIN`).
*   `POST /api/patients/:id/assign` : Asignar paciente específico al usuario actual.
*   `POST /api/patients/assign-many` : Asignar un lote de IDs de pacientes a un agente en particular (`userId`).
*   `POST /api/patients/reassign` : Reasignar de forma masiva pacientes de un agente a otro. Permite definir origen (`fromAgentId`), destino (`toAgentId`), lista de origen (`listId`) y cantidad límite (`count`).

### 📞 Interacciones y Historial
*   `POST /api/patients/:id/call` : Registrar un nuevo intento de llamada para un paciente. Guarda `status`, `notes` e incrementa automáticamente el `call_number`.
*   `GET /api/patients/:id/interactions` : Historial detallado de todas las llamadas realizadas a un paciente en particular.

### 📊 Estadísticas y Reportes
*   `GET /api/stats` : Dashboard analítico principal. Retorna el conteo total de pacientes, llamadas totales y formateados de Recharts para gráficos de barras y anillos.
*   `GET /api/stats/export` : Obtiene el reporte plano consolidado de todas las interacciones con resolución de nombres y teléfonos para exportación directa.

---

## 📈 Flujo General de Uso

1.  **Registro/Acceso**: Regístrate como administrador o ingresa con tu cuenta autorizada.
2.  **Importación**: Ve a la sección **Importar pacientes**, sube un archivo Excel o CSV. El sistema procesará cada fila, detectará automáticamente campos de contacto y guardará los campos adicionales de manera dinámica.
3.  **Asignación**: Desde la sección **Asignar** del administrador, distribuye a los pacientes de una lista importada entre tus agentes disponibles de forma masiva.
4.  **Reasignación**: Si un agente no puede atender sus asignaciones, utiliza la herramienta de reasignación masiva para transferir sus llamadas a otro agente rápidamente.
5.  **Gestión de Agente**: Cada agente inicia sesión, ingresa a **Mis asignaciones**, visualiza su cartera de pacientes asignados y registra los intentos de llamadas con sus notas de seguimiento correspondientes.
6.  **Monitoreo**: El administrador visualiza en tiempo real las métricas generales, distribuciones de llamadas y exporta informes ejecutivos en PDF o Excel.
