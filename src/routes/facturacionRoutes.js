const express = require('express');
const router = express.Router();

// 1. Importación unificada del controlador (Todo en una sola línea)
const { 
    obtenerConsumosPendientes, 
    generarFacturacionMensual, 
    obtenerFacturasMorosas, 
    fraccionarDeuda,
    obtenerEstadosCuentaGeneral, 
    obtenerDashboardFinanzas 
} = require('../controllers/facturacionController');

// 2. Importación de middlewares
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// ==========================================
// RUTAS DE FINANZAS Y FACTURACIÓN
// ==========================================

// RUTA GET: Listar consumos pendientes de facturación, agrupados por socio
// Acceso: Jefe (1) y Finanzas (4)
router.get('/consumos-pendientes', verificarToken, autorizarRoles(1, 4), obtenerConsumosPendientes);

// RUTA POST: Generar la facturación mensual (consolida consumos pendientes en facturas)
// Acceso: SOLO Finanzas (4)
router.post('/generar', verificarToken, autorizarRoles(4), generarFacturacionMensual);

// RUTA GET: Listar facturas vencidas sin pagar (morosidad)
// Acceso: Jefe (1), Finanzas (4) y Cobranza (5)
router.get('/morosos', verificarToken, autorizarRoles(1, 4, 5), obtenerFacturasMorosas);

// RUTA POST: Fraccionar una deuda existente en múltiples cuotas
// Acceso: SOLO Finanzas (4)
router.post('/fraccionar', verificarToken, autorizarRoles(4), fraccionarDeuda);

// RUTA GET: Listar estado de cuenta general para la vista principal
// Acceso: Jefe (1) y Finanzas (4)
router.get('/estados-cuenta', verificarToken, autorizarRoles(1, 4), obtenerEstadosCuentaGeneral);

// RUTA GET: Obtener KPIs y datos para las gráficas del panel de inicio
// Acceso: Jefe (1) y Finanzas (4)
router.get('/dashboard', verificarToken, autorizarRoles(1, 4), obtenerDashboardFinanzas);

module.exports = router;