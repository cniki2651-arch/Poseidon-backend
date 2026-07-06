const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Importar la conexión a la base de datos
require('./config/db');

// ========================
// CONFIGURACIÓN DE CORS
// ========================
const allowedOrigins = [
  'http://localhost:8080',                  // frontend en desarrollo local
  'https://club-nautico-web.vercel.app',    // frontend desplegado en Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origin (ej. Postman, curl, health checks) y las de la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por política de CORS'));
    }
  },
}));

app.use(express.json({ limit: '1mb' }));

// ========================
// RUTAS DE LA API
// ========================
const authRoutes = require('./routes/authRoutes');
const solicitudesRoutes = require('./routes/solicitudesRoutes');
const sociosRoutes = require('./routes/sociosRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const embarcacionesRoutes = require('./routes/embarcacionesRoutes');
const radasRoutes = require('./routes/radasRoutes');
const tripulantesRoutes = require('./routes/tripulantesRoutes');
const zarpesRoutes = require('./routes/zarpesRoutes');
const consumoRoutes = require('./routes/consumoRoutes');
const facturacionRoutes = require('./routes/facturacionRoutes');
const contactoRoutes = require('./routes/contactoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/consumos', consumoRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/socios', sociosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/embarcaciones', embarcacionesRoutes);
app.use('/api/radas', radasRoutes);
app.use('/api/tripulantes', tripulantesRoutes);
app.use('/api/zarpes', zarpesRoutes);
app.use('/api', contactoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor del Club Náutico Poseidón en línea! ⚓' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("==================================================");
    console.log(`⚓ [SISTEMA POSEIDÓN] Backend iniciado con éxito.`);
    console.log(`🌊 Servidor escuchando en el puerto ${PORT}`);
    console.log("==================================================");
});