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

module.exports = {
  registrarSolicitudRetiro
};