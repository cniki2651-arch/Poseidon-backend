const pool = require('../config/db');

// Función para obtener los conteos rápidos de la Secretaría
const obtenerMetricasSecretaria = async (req, res) => {
    try {
        // 1. Solicitudes en Espera (Estado 'Pendiente')
        const queryEspera = "SELECT COUNT(*) FROM solicitudes WHERE estado = 'Pendiente'";
        const resEspera = await pool.query(queryEspera);

        // 2. Socios Activos (Que ya no son Pendientes ni Rechazados)
        const queryActivos = "SELECT COUNT(*) FROM socios WHERE estado_membresia != 'Pendiente' AND estado_membresia != 'Rechazado'";
        const resActivos = await pool.query(queryActivos);

        // 3. Alertas (Por ejemplo, socios 'Morosos')
        const queryAlertas = "SELECT COUNT(*) FROM socios WHERE estado_membresia = 'Moroso'";
        const resAlertas = await pool.query(queryAlertas);

        // Enviamos todo en un solo JSON estructurado
        res.status(200).json({
            solicitudesEnEspera: parseInt(resEspera.rows[0].count),
            sociosActivos: parseInt(resActivos.rows[0].count),
            alertas: parseInt(resAlertas.rows[0].count)
        });
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        res.status(500).json({ mensaje: 'Error al cargar las métricas del dashboard.' });
    }
};

module.exports = {
    obtenerMetricasSecretaria
};