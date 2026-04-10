require('dotenv').config(); // <-- ESTO PRIMERO
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log de depuración para que veas qué está pasando
console.log("Revisando conexión...");
console.log("URL:", supabaseUrl ? "Detectada ✅" : "No detectada ❌");

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de Supabase en el archivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;