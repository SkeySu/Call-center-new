const supabase = require('../config/db');

const Interaction = {
    async create(interactionData) {
        const { data, error } = await supabase
            .from('interactions')
            .insert([interactionData])
            .select();

        if (error) throw error;
        return data[0];
    },

    async listByPatient(patientId) {
        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('patient_id', patientId)
            .order('date_time', { ascending: false });

        if (error) throw error;
        return data;
    },
};

module.exports = Interaction;
