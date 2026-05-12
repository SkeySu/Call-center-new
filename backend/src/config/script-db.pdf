
-- 1. Extensiones necesarias (para generar IDs tipo UUID automáticamente si se desea)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Usuarios (Auth y Roles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('ADMIN', 'AGENT')) DEFAULT 'AGENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Listas de Pacientes (Metadata de la subida)
CREATE TABLE IF NOT EXISTS patient_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    row_id TEXT,                        -- ID original del Excel
    member_id TEXT UNIQUE NOT NULL, 
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    phone TEXT,
    cell_phone TEXT,
    medical_data JSONB,                 -- JSONB es la versión optimizada de Postgres para JSON
    list_id UUID REFERENCES patient_lists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Asignaciones (Relación Agente - Paciente)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- 6. Tabla de Interacciones (Historial de llamadas/SMS)
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT,                          -- 'CALL' o 'SMS'
    status TEXT,                        -- 'Contestado', 'Buzón', etc.
    notes TEXT,
    call_number TEXT,
    date_time TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Insertar un Administrador de prueba
-- Nota: El password debe ser hasheado en el backend, aquí va uno de ejemplo.
INSERT INTO users (name, email, password, role) 
VALUES ('Admin Sistema', 'admin@test.com', 'password_hasheado_aqui', 'ADMIN');