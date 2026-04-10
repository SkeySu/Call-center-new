const supabase = require('../config/db');

const PatientList = {
    async create(listData) {
        const { data, error } = await supabase
            .from('patient_lists')
            .insert([listData])
            .select();

        if (error) throw error;
        return data[0];
    },

    async list() {
        const { data, error } = await supabase
            .from('patient_lists')
            .select('*')
            .order('upload_date', { ascending: false });

        if (error) throw error;
        return data;
    },
};

module.exports = PatientList;
