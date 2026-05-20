const supabase = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total de pacientes
        const { count: totalPatients, error: pError } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true });
        
        if (pError) throw pError;

        // 2. Interacciones y estados
        const { data: interactionsData, error: iError } = await supabase
            .from('interactions')
            .select('status, agent_id');
            
        if (iError) throw iError;

        // 3. Obtener nombres de agentes
        const { data: usersData, error: uError } = await supabase
            .from('users')
            .select('id, name');

        if (uError) throw uError;

        const usersMap = {};
        usersData.forEach(u => {
            usersMap[u.id] = u.name || 'Agente Desconocido';
        });

        const callsByStatus = {};
        const callsByAgent = {};
        let totalCalls = 0;
        
        interactionsData.forEach(interaction => {
            const status = interaction.status || 'Desconocido';
            const agentName = usersMap[interaction.agent_id] || 'Desconocido';

            callsByStatus[status] = (callsByStatus[status] || 0) + 1;
            callsByAgent[agentName] = (callsByAgent[agentName] || 0) + 1;
            totalCalls++;
        });

        // Formato para recharts en el frontend
        const callsChartData = Object.keys(callsByStatus).map(key => ({
            name: key,
            value: callsByStatus[key]
        }));

        const agentChartData = Object.keys(callsByAgent).map(key => ({
            name: key,
            value: callsByAgent[key]
        }));

        res.json({
            data: {
                totalPatients: totalPatients || 0,
                totalCalls,
                callsChartData,
                agentChartData
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message || error });
    }
};

exports.getDetailedReport = async (req, res) => {
    try {
        // Fetch all interactions with user and patient details
        // Note: Make sure the foreign keys are set up correctly in Supabase.
        // interactions.agent_id -> users.id
        // interactions.patient_id -> patients.id
        const { data: interactionsData, error: iError } = await supabase
            .from('interactions')
            .select(`
                id,
                date_time,
                status,
                notes,
                call_number,
                agent_id,
                patient_id
            `)
            .order('date_time', { ascending: false });

        if (iError) throw iError;

        // Manually map to avoid PostgREST complex join errors if relations aren't perfect
        const { data: usersData, error: uError } = await supabase.from('users').select('id, name');
        if (uError) throw uError;

        const { data: patientsData, error: pError } = await supabase.from('patients').select('id, first_name, last_name, phone');
        if (pError) throw pError;

        const usersMap = {};
        usersData.forEach(u => usersMap[u.id] = u.name);

        const patientsMap = {};
        patientsData.forEach(p => {
            patientsMap[p.id] = {
                fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Desconocido',
                phone: p.phone || 'Sin número'
            };
        });

        const reportData = interactionsData.map(interaction => ({
            id: interaction.id,
            fecha: new Date(interaction.date_time).toLocaleString(),
            agente: usersMap[interaction.agent_id] || 'Desconocido',
            paciente: patientsMap[interaction.patient_id]?.fullName || 'Desconocido',
            telefono: patientsMap[interaction.patient_id]?.phone || 'Sin número',
            estado: interaction.status || 'Desconocido',
            notas: interaction.notes || '',
            num_llamada: interaction.call_number || '1'
        }));

        res.json({ data: reportData });
    } catch (error) {
        console.error('Error fetching detailed report:', error);
        res.status(500).json({ message: 'Error al obtener el reporte', error: error.message || error });
    }
};
