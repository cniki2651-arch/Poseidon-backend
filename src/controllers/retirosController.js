const pool = require('../config/db');

// Función para REGISTRAR una nueva Solicitud de Retiro (VPG9-31)
const registrarSolicitudRetiro = async (req, res) => {
  const { id_socio, motivo } = req.body;
  const id_usuario_atencion = req.usuario.id_usuario; // El ID de la secretaria que está en sesión

  if (!id_socio) {
    return res.status(400).json({ mensaje: 'El ID del socio es obligatorio.' });
  }

  try {
    // 1. Verificar si el socio ya tiene una solicitud pendiente para evitar duplicados
    const checkQuery = `SELECT id_solicitud FROM solicitudes_retiro WHERE id_socio = $1 AND estado_solicitud = 'Pendiente'`;
    const checkRes = await pool.query(checkQuery, [id_socio]);

    if (checkRes.rows.length > 0) {
      return res.status(400).json({ 
        mensaje: 'Este socio ya tiene una solicitud de retiro en proceso.' 
      });
    }

    // 2. Insertar la nueva solicitud en la base de datos
    const insertQuery = `
      INSERT INTO solicitudes_retiro (id_socio, motivo, id_usuario_atencion)
      VALUES ($1, $2, $3)
      RETURNING id_solicitud, fecha_solicitud, estado_solicitud;
    `;
    const result = await pool.query(insertQuery, [id_socio, motivo, id_usuario_atencion]);

    res.status(201).json({
      mensaje: 'Solicitud de retiro registrada exitosamente.',
      solicitud: result.rows[0]
    });

  } catch (error) {
    console.error('Error al registrar solicitud de retiro:', error);
    res.status(500).json({ mensaje: 'Error interno al procesar la solicitud de retiro.' });
  }
};

// Función para LISTAR las solicitudes de retiro pendientes (VPG9-32)
const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const query = `
      SELECT 
        sr.id_solicitud,
        sr.id_socio,
        sr.motivo,
        sr.fecha_solicitud,
        sr.estado_solicitud,
        soc.nombres,
        soc.apellidos,
        soc.dni,
        COALESCE(SUM(f.monto_total), 0) AS deuda_pendiente
      FROM solicitudes_retiro sr
      INNER JOIN socios soc ON sr.id_socio = soc.id_socio
      LEFT JOIN facturacion f ON sr.id_socio = f.id_socio 
           AND f.estado_pago NOT IN ('Pagada', 'Fraccionada')
      WHERE sr.estado_solicitud = 'Pendiente'
      GROUP BY sr.id_solicitud, soc.nombres, soc.apellidos, soc.dni
      ORDER BY sr.fecha_solicitud ASC;
    `;
    const resultado = await pool.query(query);
    
    // Transformamos los datos numéricos para el frontend
    const solicitudes = resultado.rows.map(row => ({
      ...row,
      deuda_pendiente: Number(row.deuda_pendiente)
    }));

    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes de retiro pendientes:', error);
    res.status(500).json({ mensaje: 'Error al cargar las solicitudes pendientes.' });
  }
};

module.exports = {
    registrarSolicitudRetiro,
    obtenerSolicitudesPendientes
};