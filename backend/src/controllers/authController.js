const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTRO (Ya lo tenías, asegúrate de que esté así)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'AGENT'
        });
        res.status(201).json({ message: "Usuario creado", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN (Nuevo)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

        // 3. Crear Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: "Login exitoso",
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listUsers = async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
        }

        const data = await User.findAll();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message || error });
    }
};

exports.createUser = async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
        }

        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'AGENT'
        });

        res.status(201).json({ message: 'Usuario creado correctamente', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message || error });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Contraseña nueva es requerida.' });
        }

        if (req.user?.role !== 'ADMIN' && req.user?.id !== targetUserId) {
            return res.status(403).json({ message: 'Acceso denegado. No puedes cambiar esta contraseña.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const supabase = require('../config/db');
        const { data, error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', targetUserId);

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar contraseña', error: error.message || error });
    }
};