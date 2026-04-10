const { v4: uuidv4 } = require('uuid');
const Patient = require('../models/patientModel');
const PatientList = require('../models/patientListModel');
const User = require('../models/userModel');

const fieldValue = (row, keys) => {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
        }
    }
    return null;
};

const normalizePatientRecord = (raw) => {
    const row = raw && typeof raw === 'object' ? { ...raw } : {};
    const nestedMedicalData = row.medical_data && typeof row.medical_data === 'object' ? { ...row.medical_data } : {};
    delete row.medical_data;

    const externalId = fieldValue(row, ['row_id', 'id', 'patient_id', 'dni', 'documento', 'document']);
    const firstName = fieldValue(row, ['first_name', 'member_first_name', 'member first name', 'nombre', 'nombres']) || null;
    const lastName = fieldValue(row, ['last_name', 'member_last_name', 'member last name', 'apellido', 'apellidos']) || null;
    const fullName = fieldValue(row, ['name', 'member_name', 'full_name', 'nombre_completo', 'patient_name']) || null;
    const phone = fieldValue(row, ['phone', 'telefono', 'phone_number', 'contact', 'contacto']) || null;
    const cell_phone = fieldValue(row, ['cell_phone', 'celular', 'mobile']) || null;
    const email = fieldValue(row, ['email', 'correo', 'email_address', 'mail']) || null;

    let first_name = '';
    let last_name = '';

    if (firstName || lastName) {
        first_name = firstName ? String(firstName).trim() : (lastName ? String(lastName).split(/\s+/)[0] : 'Desconocido');
        last_name = lastName ? String(lastName).trim() : first_name;
    } else {
        const candidateName = String(fullName || '').trim();
        const nameParts = candidateName.split(/\s+/).filter(Boolean);
        first_name = nameParts.shift() || 'Desconocido';
        last_name = nameParts.length ? nameParts.join(' ') : first_name;
    }

    const member_id = externalId ? String(externalId).trim() : uuidv4();
    const row_id = externalId ? String(externalId).trim() : null;

    const reservedKeys = new Set([
        'row_id',
        'id',
        'patient_id',
        'dni',
        'documento',
        'document',
        'name',
        'full_name',
        'nombre',
        'nombre_completo',
        'patient_name',
        'phone',
        'cell_phone',
        'email',
        'correo',
        'email_address',
        'mail',
        'medical_data',
        'source',
        'status',
    ]);

    const medical_data = { ...nestedMedicalData };
    Object.entries(row).forEach(([key, value]) => {
        if (reservedKeys.has(key.toLowerCase().trim())) return;
        if (value === undefined || value === null || value === '') return;
        medical_data[key] = value;
    });

    return {
        member_id,
        row_id,
        first_name,
        last_name,
        phone,
        cell_phone,
        medical_data: {
            ...medical_data,
            email,
            imported_at: new Date().toISOString(),
            source: row.source || 'excel_import',
            status: row.status || 'new',
        },
    };
};

exports.bulkUpload = async (req, res) => {
    try {
        const payload = Array.isArray(req.body) ? req.body : req.body?.patients;
        const fileName = req.body?.file_name || 'Importación sin nombre';
        if (!Array.isArray(payload) || payload.length === 0) {
            return res.status(400).json({ message: 'No se recibieron registros válidos para importar.' });
        }

        const listRecord = await PatientList.create({ file_name: fileName });
        const records = payload.map((row) => ({ ...normalizePatientRecord(row), list_id: listRecord.id }));
        const inserted = await Patient.bulkInsert(records);

        res.status(201).json({
            message: 'Importación completada con éxito',
            list: listRecord,
            importedCount: inserted.length,
            data: inserted,
        });
    } catch (error) {
        console.error('Error bulk upload:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Error al guardar los pacientes', error: error.message || error });
    }
};

exports.listPatients = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 200;
        const offset = Number(req.query.offset) || 0;
        const listId = req.query.listId || null;
        const onlyUnassigned = req.query.onlyUnassigned !== 'false';
        const data = await Patient.list({ limit, offset, listId, onlyUnassigned });
        res.json({ data });
    } catch (error) {
        console.error('Error list patients:', error);
        res.status(500).json({ message: 'Error al obtener pacientes', error: error.message || error });
    }
};

exports.listPatientLists = async (req, res) => {
    try {
        const data = await PatientList.list();
        res.json({ data });
    } catch (error) {
        console.error('Error list patient lists:', error);
        res.status(500).json({ message: 'Error al obtener listas de pacientes', error: error.message || error });
    }
};

exports.listAssignedPatients = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(400).json({ message: 'Agente no identificado.' });

        const assignments = await Patient.listAssignedToAgent(userId);
        res.json({ data: assignments });
    } catch (error) {
        console.error('Error list assigned patients:', error);
        res.status(500).json({ message: 'Error al obtener pacientes asignados', error: error.message || error });
    }
};

exports.listAllAssignments = async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
        }

        const assignments = await Patient.listAllAssignments();
        res.json({ data: assignments });
    } catch (error) {
        console.error('Error list all assignments:', error);
        res.status(500).json({ message: 'Error al obtener todas las asignaciones', error: error.message || error });
    }
};

exports.listAgents = async (req, res) => {
    try {
        const data = await User.findAgents();
        res.json({ data });
    } catch (error) {
        console.error('Error list agents:', error);
        res.status(500).json({ message: 'Error al obtener agentes', error: error.message || error });
    }
};

exports.assignPatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        if (!patientId) return res.status(400).json({ message: 'Patient ID es requerido' });

        const assignment = await Patient.assign(patientId, req.user?.id);
        res.status(201).json({ message: 'Paciente asignado', assignment });
    } catch (error) {
        console.error('Error assign patient:', error);
        res.status(500).json({ message: 'Error al asignar paciente', error: error.message || error });
    }
};

exports.assignManyPatients = async (req, res) => {
    try {
        const patientIds = Array.isArray(req.body.patientIds) ? req.body.patientIds : [];
        const userId = req.body.userId || req.user?.id;
        if (!patientIds.length) return res.status(400).json({ message: 'No se enviaron pacientes para asignar.' });
        if (!userId) return res.status(400).json({ message: 'Agente seleccionado es requerido.' });

        const assignments = await Patient.assignMany(patientIds, userId);
        res.status(201).json({ message: 'Pacientes asignados correctamente', assignments });
    } catch (error) {
        console.error('Error assign many patients:', error);
        res.status(500).json({ message: 'Error al asignar varios pacientes', error: error.message || error });
    }
};

exports.reassignPatients = async (req, res) => {
    try {
        const patientIds = Array.isArray(req.body.patientIds) ? req.body.patientIds : [];
        const fromAgentId = req.body.fromAgentId || null;
        const toAgentId = req.body.toAgentId || null;
        const count = Number(req.body.count) || 0;
        const listId = req.body.listId || null;

        if (!toAgentId) return res.status(400).json({ message: 'Agente destino es requerido.' });

        let idsToReassign = patientIds;
        if (!idsToReassign.length) {
            if (!fromAgentId) return res.status(400).json({ message: 'Agente origen es requerido cuando no se envían IDs.' });
            idsToReassign = await Patient.activeAssigned({ fromAgentId, listId, limit: count || 100 });
        }

        if (!idsToReassign.length) {
            return res.status(400).json({ message: 'No se encontraron pacientes para reasignar.' });
        }

        if (count > 0 && idsToReassign.length > count) {
            idsToReassign = idsToReassign.slice(0, count);
        }

        const assignments = await Patient.reassignMany(idsToReassign, toAgentId, fromAgentId);
        res.status(201).json({ message: 'Pacientes reasignados correctamente', assignments });
    } catch (error) {
        console.error('Error reassign patients:', error);
        res.status(500).json({ message: 'Error al reasignar pacientes', error: error.message || error });
    }
};
