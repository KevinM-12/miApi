
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const sequelize = require('./config/db');

// MODELOS
const Producto = require('./models/Producto');
const Categoria = require('./models/Categoria');
const Proveedor = require('./models/Proveedor');
const Movimiento = require('./models/Movimiento');
const Usuario = require('./models/Usuario');

// RUTAS Y MIDDLEWARE
const authRoutes = require('./routes/authRoutes');
const autenticar = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// RELACIONES ENTRE MODELOS
// ========================================

// CATEGORÍA - PRODUCTOS
Categoria.hasMany(Producto, {
    foreignKey: 'categoria_id'
});

Producto.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});

// PROVEEDOR - PRODUCTOS
Proveedor.hasMany(Producto, {
    foreignKey: 'proveedor_id'
});

Producto.belongsTo(Proveedor, {
    foreignKey: 'proveedor_id'
});

// PRODUCTO - MOVIMIENTOS
Producto.hasMany(Movimiento, {
    foreignKey: 'producto_id'
});

Movimiento.belongsTo(Producto, {
    foreignKey: 'producto_id'
});

// USUARIO - MOVIMIENTOS
Usuario.hasMany(Movimiento, {
    foreignKey: 'usuario_id'
});

Movimiento.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

// ========================================
// CONFIGURACIÓN DEL SERVIDOR
// ========================================

app.use(express.json());

app.use(helmet());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limitador = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
});

app.use('/api/', limitador);

// AUTENTICACIÓN
app.use('/api/auth', authRoutes);

// RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// ========================================
// CRUD DE PRODUCTOS
// ========================================

// POST: Crear producto
app.post('/api/productos', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const nuevoProducto = await Producto.create(req.body);

        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Listar productos
app.get('/api/productos', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const productos = await Producto.findAll();

        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar producto
app.put('/api/productos/:id', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const [actualizados] = await Producto.update(req.body, {
            where: { id: req.params.id }
        });

        if (!actualizados) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar producto
app.delete('/api/productos/:id', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const eliminado = await Producto.destroy({
            where: { id: req.params.id }
        });

        if (!eliminado) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// CRUD DE CATEGORÍAS
// ========================================

// GET: Listar categorías
app.get('/api/categorias', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const categorias = await Categoria.findAll();

        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear categoría
app.post('/api/categorias', autenticar(['Administrador']), async (req, res) => {
    try {
        const nuevaCategoria = await Categoria.create(req.body);

        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar categoría
app.put('/api/categorias/:id', autenticar(['Administrador']), async (req, res) => {
    try {
        const [actualizadas] = await Categoria.update(req.body, {
            where: { id: req.params.id }
        });

        if (!actualizadas) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        res.json({ message: 'Categoría actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar categoría
app.delete('/api/categorias/:id', autenticar(['Administrador']), async (req, res) => {
    try {
        const eliminada = await Categoria.destroy({
            where: { id: req.params.id }
        });

        if (!eliminada) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// CRUD DE PROVEEDORES
// ========================================

// GET: Listar proveedores
app.get('/api/proveedores', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll();

        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear proveedor
app.post('/api/proveedores', autenticar(['Administrador']), async (req, res) => {
    try {
        const nuevoProveedor = await Proveedor.create(req.body);

        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar proveedor
app.put('/api/proveedores/:id', autenticar(['Administrador']), async (req, res) => {
    try {
        const [actualizados] = await Proveedor.update(req.body, {
            where: { id: req.params.id }
        });

        if (!actualizados) {
            return res.status(404).json({ error: 'Proveedor no encontrado.' });
        }

        res.json({ message: 'Proveedor actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar proveedor
app.delete('/api/proveedores/:id', autenticar(['Administrador']), async (req, res) => {
    try {
        const eliminado = await Proveedor.destroy({
            where: { id: req.params.id }
        });

        if (!eliminado) {
            return res.status(404).json({ error: 'Proveedor no encontrado.' });
        }

        res.json({ message: 'Proveedor eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// USUARIOS
// ========================================

// GET: Listar usuarios sin mostrar contraseñas
app.get('/api/usuarios', autenticar(['Administrador']), async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] }
        });

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// MOVIMIENTOS DE INVENTARIO
// ========================================

// POST: Registrar entrada, salida o ajuste
app.post('/api/movimientos', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            producto_id,
            tipo_movimiento,
            cantidad,
            observaciones
        } = req.body;

        if (!producto_id || !tipo_movimiento || cantidad === undefined || cantidad === null) {
            await transaction.rollback();

            return res.status(400).json({
                error: 'Debes completar el producto, tipo de movimiento y cantidad.'
            });
        }

        if (!['Entrada', 'Salida', 'Ajuste'].includes(tipo_movimiento)) {
            await transaction.rollback();

            return res.status(400).json({
                error: 'Tipo de movimiento no válido.'
            });
        }

        if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
            await transaction.rollback();

            return res.status(400).json({
                error: 'La cantidad debe ser un número entero mayor que cero.'
            });
        }

        const producto = await Producto.findByPk(producto_id, {
            transaction,
            lock: true
        });

        if (!producto) {
            await transaction.rollback();

            return res.status(404).json({
                error: 'Producto no encontrado.'
            });
        }

        const stockAnterior = Number(producto.stock);
        let nuevoStock = stockAnterior;

        if (tipo_movimiento === 'Entrada') {
            nuevoStock += Number(cantidad);
        }

        if (tipo_movimiento === 'Salida') {
            if (stockAnterior < Number(cantidad)) {
                await transaction.rollback();

                return res.status(400).json({
                    error: 'Stock insuficiente para realizar la salida.'
                });
            }

            nuevoStock -= Number(cantidad);
        }

        if (tipo_movimiento === 'Ajuste') {
            nuevoStock = Number(cantidad);
        }

        await producto.update(
            { stock: nuevoStock },
            { transaction }
        );

        const nuevoMovimiento = await Movimiento.create({
            producto_id,
            usuario_id: req.usuario.id,
            tipo_movimiento,
            cantidad,
            observaciones
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Movimiento registrado correctamente.',
            movimiento: nuevoMovimiento,
            stock_anterior: stockAnterior,
            stock_actual: nuevoStock
        });

    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            error: error.message
        });
    }
});

// GET: Listar movimientos
app.get('/api/movimientos', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const movimientos = await Movimiento.findAll({
            include: [
                {
                    model: Producto,
                    attributes: ['id', 'nombre']
                },
                {
                    model: Usuario,
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fecha_hora', 'DESC']]
        });

        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Consultar Kardex de un producto
app.get('/api/kardex/:producto_id', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const movimientos = await Movimiento.findAll({
            where: {
                producto_id: req.params.producto_id
            },
            include: [
                {
                    model: Producto,
                    attributes: ['id', 'nombre']
                },
                {
                    model: Usuario,
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fecha_hora', 'ASC']]
        });

        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// CONEXIÓN Y ARRANQUE DEL SERVIDOR
// ========================================

sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos conectada y sincronizada.');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });
