const express = require('express');
const router = express.Router();

const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO DE USUARIOS
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validar campos obligatorios
        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: 'Nombre, email y contraseña son obligatorios.'
            });
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await Usuario.findOne({
            where: { email }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensaje: 'Este correo ya está registrado.'
            });
        }

        // El hook beforeCreate de Usuario.js cifra la contraseña
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password,
            rol: rol || 'Almacenero'
        });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente.',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar usuario.',
            error: error.message
        });
    }
});


// INICIO DE SESIÓN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Debes ingresar email y contraseña.'
            });
        }

        const usuario = await Usuario.findOne({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        // Comparar contraseña ingresada con el hash almacenado
        const passwordValido = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValido) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('No se ha configurado JWT_SECRET.');
        }

        // Generar token
        const token = jwt.sign(
            {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al iniciar sesión.',
            error: error.message
        });
    }
});

module.exports = router;