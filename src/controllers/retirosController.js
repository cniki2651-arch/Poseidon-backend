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

// Función para APROBAR el retiro y dar de baja al socio (VPG9-32)
const aprobarBajaSocio = async (req, res) => {
  const { id_solicitud, id_socio } = req.body;
  const id_usuario_atencion = req.usuario.id_usuario;

  if (!id_solicitud || !id_socio) {
    return res.status(400).json({ mensaje: 'Faltan datos para procesar la baja.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificación de seguridad backend: ¿Realmente tiene deuda 0?
    const deudaQuery = `
      SELECT COALESCE(SUM(monto_total), 0) AS total_deuda 
      FROM facturacion 
      WHERE id_socio = $1 AND estado_pago NOT IN ('Pagada', 'Fraccionada')
    `;
    const resDeuda = await client.query(deudaQuery, [id_socio]);
    
    if (Number(resDeuda.rows[0].total_deuda) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensaje: 'No se puede dar de baja. El socio mantiene deudas pendientes.' });
    }

    // 2. Marcar la solicitud como Aprobada
    const updateSolicitud = `
      UPDATE solicitudes_retiro 
      SET estado_solicitud = 'Aprobada', fecha_procesamiento = CURRENT_TIMESTAMP, id_usuario_atencion = $1
      WHERE id_solicitud = $2
    `;
    await client.query(updateSolicitud, [id_usuario_atencion, id_solicitud]);

    // 3. Dar de baja al socio en el sistema
    const updateSocio = `
      UPDATE socios 
      SET estado_membresia = 'Retirado' 
      WHERE id_socio = $1
    `;
    await client.query(updateSocio, [id_socio]);

    await client.query('COMMIT');
    res.status(200).json({ mensaje: 'Socio dado de baja exitosamente del club.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al procesar la baja del socio:', error);
    res.status(500).json({ mensaje: 'Error interno al procesar la baja.' });
  } finally {
    client.release();
  }
};

module.exports = {
    registrarSolicitudRetiro,
    obtenerSolicitudesPendientes,
    aprobarBajaSocio
};