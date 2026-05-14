const express = require('express');
const router = express.Router();
const { obtenerMetricasSecretaria } = require('../controllers/dashboardController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// RUTA GET: Obtener métricas (Acceso para Jefe y Secretaría)
router.get('/secretaria', verificarToken, autorizarRoles(1, 2), obtenerMetricasSecretaria);

module.exports = router;