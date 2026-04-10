const supabase = require('../config/db');

const Patient = {
    async bulkInsert(records) {
        const { data, error } = await supabase
            .from('patients')
            .insert(records)
            .select();

        if (error) throw error;
        return data;
    },

    async list({ limit = 200, offset = 0, listId = null, onlyUnassigned = true } = {}) {
        let query = supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });

        if (listId) {
            query = query.eq('list_id', listId);
        }

        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) throw error;

        if (!onlyUnassigned || !data.length) return data;

        const patientIds = data.map((patient) => patient.id);
        const { data: assignments, error: assignError } = await supabase
            .from('assignments')
            .select('patient_id')
            .eq('active', true)
            .in('patient_id', patientIds);
        if (assignError) throw assignError;

        const assignedIds = new Set(assignments.map((item) => item.patient_id));
        return data.filter((patient) => !assignedIds.has(patient.id));
    },

    async listAssignedToAgent(agentId, { limit = 200, offset = 0, listId = null } = {}) {
        const query = supabase
            .from('patients')
            .select('*, assignments!inner(user_id, active), interactions(*)')
            .order('created_at', { ascending: false })
            .eq('assignments.user_id', agentId)
            .eq('assignments.active', true);

        if (listId) {
            query.eq('list_id', listId);
        }

        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) throw error;

        return data;
    },

    async listAllAssignments({ limit = 200, offset = 0, listId = null } = {}) {
        let query = supabase
            .from('assignments')
            .select('*, patient:patients(*), user:users(id, name, role)')
            .eq('active', true)
            .order('assigned_at', { ascending: false });

        if (listId) {
            query = query.eq('patient.list_id', listId);
        }

        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) throw error;

        return data;
    },

    async assign(patientId, userId) {
        const { data, error } = await supabase
            .from('assignments')
            .insert([{ patient_id: patientId, user_id: userId }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async assignMany(patientIds, userId) {
        const records = patientIds.map((patientId) => ({ patient_id: patientId, user_id: userId }));
        const { data, error } = await supabase
            .from('assignments')
            .insert(records)
            .select();

        if (error) throw error;
        return data;
    },

    async activeAssigned({ fromAgentId, listId = null, limit = 100 } = {}) {
        const assignmentQuery = supabase
            .from('assignments')
            .select('patient_id')
            .eq('active', true);

        if (fromAgentId) assignmentQuery.eq('user_id', fromAgentId);

        const { data: assignmentData, error: assignmentError } = await assignmentQuery.limit(limit);
        if (assignmentError) throw assignmentError;

        const patientIds = assignmentData.map((item) => item.patient_id);
        if (!patientIds.length) return [];

        const patientQuery = supabase.from('patients').select('id');
        if (listId) {
            patientQuery.in('id', patientIds).eq('list_id', listId).limit(limit);
        } else {
            patientQuery.in('id', patientIds).limit(limit);
        }

        const { data: patientData, error: patientError } = await patientQuery;
        if (patientError) throw patientError;
        return patientData.map((item) => item.id);
    },

    async reassignMany(patientIds, userId, fromUserId = null) {
        const updateQuery = supabase
            .from('assignments')
            .update({ active: false })
            .in('patient_id', patientIds)
            .eq('active', true);

        if (fromUserId) updateQuery.eq('user_id', fromUserId);

        const { error: deactivateError } = await updateQuery;
        if (deactivateError) throw deactivateError;

        const records = patientIds.map((patientId) => ({ patient_id: patientId, user_id: userId }));
        const { data, error } = await supabase.from('assignments').insert(records).select();

        if (error) throw error;
        return data;
    },

    async isAssignedToAgent(patientId, userId) {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('patient_id', patientId)
            .eq('user_id', userId)
            .eq('active', true)
            .limit(1);

        if (error) throw error;
        return Array.isArray(data) && data.length > 0;
    },
};

module.exports = Patient;
