const supabase = require('../config/db');

const User = {
    // Buscar usuario por email (para el Login)
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single(); // Trae solo un objeto, no un array
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "no filas encontradas"
        return data;
    },

    // Obtener agentes activos
    async findAgents() {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, role')
            .in('role', ['AGENT', 'ADMIN']);

        if (error) throw error;
        return data;
    },

    // Crear un nuevo usuario
    async create(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async findAll() {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at');

        if (error) throw error;
        return data;
    },
};

module.exports = User;