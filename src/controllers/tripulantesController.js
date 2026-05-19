const pool = require('../config/db');

// 1. Obtener todos los tripulantes (Incluyendo las siglas del tipo de documento)
const obtenerTripulantes = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id_tripulante, 
                t.nombres, 
                t.apellidos, 
                t.dni, 
                t.rol, 
                t.licencia, 
                t.estado,
                td.siglas AS tipo_doc_siglas
            FROM tripulantes t
            LEFT JOIN tipos_documento td ON t.id_tipo_doc = td.id_tipo_doc
            ORDER BY t.id_tripulante DESC
        `;
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener tripulantes:', error);
        res.status(500).json({ mensaje: 'Error al cargar la tripulación.' });
    }
};

// 2. Registrar un nuevo tripulante
const crearTripulante = async (req, res) => {
    // Ahora extraemos id_tipo_doc enviado por el frontend
    const { id_tipo_doc, nombres, apellidos, dni, rol, licencia } = req.body;

    // Validación de campos obligatorios
    if (!dni || !nombres || !apellidos || !rol) {
        return res.status(400).json({ mensaje: 'El número de documento, nombres, apellidos y rol son obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO tripulantes (id_tipo_doc, nombres, apellidos, dni, rol, licencia, estado)
            VALUES ($1, $2, $3, $4, $5, $6, 'Autorizado')
            RETURNING *
        `;
        // Usamos id_tipo_doc || 1 como plan de rescate por si se envía vacío (por defecto DNI)
        const values = [id_tipo_doc || 1, nombres, apellidos, dni, rol, licencia || null];
        const resultado = await pool.query(query, values);

        res.status(201).json({ 
            mensaje: 'Tripulante registrado con éxito', 
            tripulante: resultado.rows[0] 
        });
    } catch (error) {
        console.error('Error al crear tripulante:', error);
        
        // Error de clave duplicada (Unique constraint)
        if (error.code === '23505') {
            return res.status(400).json({ mensaje: 'El número de documento ingresado ya está registrado.' });
        }
        res.status(500).json({ mensaje: 'Error interno al registrar.' });
    }
};

module.exports = { obtenerTripulantes, crearTripulante };