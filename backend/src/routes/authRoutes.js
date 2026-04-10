const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.listUsers);
router.post('/users', authMiddleware, authController.createUser);
router.put('/users/:id/password', authMiddleware, authController.updatePassword);

module.exports = router;