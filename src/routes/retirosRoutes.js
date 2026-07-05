const express = require('express');
const router = express.Router();
const { registrarSolicitudRetiro } = require('../controllers/retirosController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// RUTA POST: Crear solicitud de retiro
// Acceso: Jefe (1) y Secretaría de Atención al Cliente (2)
router.post('/solicitar', verificarToken, autorizarRoles(1, 2), registrarSolicitudRetiro);

module.exports = router;