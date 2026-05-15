const pool = require('../config/db');

// 1. Obtener todos los tripulantes
const obtenerTripulantes = async (req, res) => {
    try {
        const query = 'SELECT * FROM tripulantes ORDER BY id_tripulante DESC';
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener tripulantes:', error);
        res.status(500).json({ mensaje: 'Error al cargar la tripulación.' });
    }
};

// 2. Registrar un nuevo tripulante
const crearTripulante = async (req, res) => {
    const { nombres, apellidos, dni, rol, licencia } = req.body;

    try {
        const query = `
            INSERT INTO tripulantes (nombres, apellidos, dni, rol, licencia, estado)
            VALUES ($1, $2, $3, $4, $5, 'Autorizado')
            RETURNING *
        `;
        const values = [nombres, apellidos, dni, rol, licencia || null];
        const resultado = await pool.query(query, values);

        res.status(201).json({ mensaje: 'Tripulante registrado con éxito', tripulante: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear tripulante:', error);
        if (error.code === '23505') {
            return res.status(400).json({ mensaje: 'El DNI ingresado ya está registrado.' });
        }
        res.status(500).json({ mensaje: 'Error interno al registrar.' });
    }
};

module.exports = { obtenerTripulantes, crearTripulante };