const express = require('express');
const cors = require('cors'); // ✅ Excelente que lo hayas incluido
require('dotenv').config();

const app = express();

// Importar la conexión a la base de datos
require('./config/db');

// Middlewares globales
app.use(cors()); // ✅ Mantenlo siempre aquí para que Nicole no tenga bloqueos
app.use(express.json()); 

// ========================
// RUTAS DE LA API
// ========================
const authRoutes = require('./routes/authRoutes');
const solicitudesRoutes = require('./routes/solicitudesRoutes'); // ⬅️ IMPORTANTE: Agregamos las solicitudes

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes); // ⬅️ IMPORTANTE: Habilitamos las rutas de solicitudes

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor del Club Náutico Poseidón en línea! ⚓' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});