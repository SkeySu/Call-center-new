const Interaction = require('../models/interactionModel');
const Patient = require('../models/patientModel');

exports.listInteractions = async (req, res) => {
    try {
        const patientId = req.params.id;
        if (!patientId) return res.status(400).json({ message: 'Patient ID es requerido.' });

        const interactions = await Interaction.listByPatient(patientId);
        res.json({ data: interactions });
    } catch (error) {
        console.error('Error list interactions:', error);
        res.status(500).json({ message: 'Error al obtener interacciones', error: error.message || error });
    }
};

exports.logCall = async (req, res) => {
    try {
        const patientId = req.params.id;
        const agentId = req.user?.id;
        let { call_number, status, notes } = req.body;

        if (!patientId) return res.status(400).json({ message: 'Patient ID es requerido.' });
        if (!agentId) return res.status(400).json({ message: 'Agente no identificado.' });

        const assigned = await Patient.isAssignedToAgent(patientId, agentId);
        if (!assigned) {
            return res.status(403).json({ message: 'Paciente no asignado al agente actual.' });
        }

        if (!call_number) {
            const interactions = await Interaction.listByPatient(patientId);
            call_number = String((interactions?.length || 0) + 1);
        }

        const interactionData = {
            patient_id: patientId,
            agent_id: agentId,
            type: 'CALL',
            status: status || 'Pendiente',
            notes: notes || '',
            call_number,
            date_time: new Date().toISOString(),
        };

        let interaction;
        try {
            interaction = await Interaction.create(interactionData);
        } catch (insertError) {
            const insertMessage = insertError?.message || '';
            if (insertError?.code === '42703' && /call_number/i.test(insertMessage)) {
                const fallbackData = { ...interactionData };
                delete fallbackData.call_number;
                interaction = await Interaction.create(fallbackData);
                return res.status(201).json({
                    message: 'Llamada registrada correctamente, pero la columna call_number falta en la tabla interactions. Ejecuta ALTER TABLE interactions ADD COLUMN call_number TEXT; para guardarla permanentemente.',
                    interaction,
                });
            }
            throw insertError;
        }

        res.status(201).json({ message: 'Llamada registrada correctamente', interaction });
    } catch (error) {
        console.error('Error log call:', error);
        const message = error?.message || 'Error al registrar la llamada';
        if (error?.code === '42703' && /call_number/i.test(message)) {
            return res.status(500).json({
                message: 'Error de base de datos: la columna call_number no existe en la tabla interactions. Ejecuta ALTER TABLE interactions ADD COLUMN call_number TEXT;',
                error: message,
            });
        }
        res.status(500).json({ message: 'Error al registrar la llamada', error: message });
    }
};
