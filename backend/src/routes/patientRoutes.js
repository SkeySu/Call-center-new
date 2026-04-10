const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const interactionController = require('../controllers/interactionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, patientController.listPatients);
router.get('/lists', authMiddleware, patientController.listPatientLists);
router.get('/agents', authMiddleware, patientController.listAgents);
router.get('/assigned', authMiddleware, patientController.listAssignedPatients);
router.get('/assignments', authMiddleware, patientController.listAllAssignments);
router.post('/bulk', authMiddleware, patientController.bulkUpload);
router.post('/:id/assign', authMiddleware, patientController.assignPatient);
router.post('/assign-many', authMiddleware, patientController.assignManyPatients);
router.post('/reassign', authMiddleware, patientController.reassignPatients);
router.post('/:id/call', authMiddleware, interactionController.logCall);
router.get('/:id/interactions', authMiddleware, interactionController.listInteractions);

module.exports = router;
