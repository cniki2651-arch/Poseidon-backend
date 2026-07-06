const express = require('express');
const router = express.Router();
const { registrarSolicitudRetiro } = require('../controllers/retirosController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerSolicitudesPendientes } = require('../controllers/retirosController');
const { aprobarBajaSocio } = require('../controllers/retirosController');

// RUTA POST: Crear solicitud de retiro
// Acceso: Jefe (1) y Secretaría de Atención al Cliente (2)
router.post('/solicitar', verificarToken, autorizarRoles(1, 2), registrarSolicitudRetiro);

// RUTA POST: Aprobar retiro y liquidar socio
// Acceso: Jefe (1)
router.post('/aprobar', verificarToken, autorizarRoles(1), aprobarBajaSocio);

// RUTA GET: Listar solicitudes pendientes con cálculo de deuda
// Acceso: Jefe (1)
router.get('/pendientes', verificarToken, autorizarRoles(1), obtenerSolicitudesPendientes);

module.exports = router;