
const pool = require("../config/db");

// ── Listar disponibilidad de todos los servicios ────────────────────────────
const listarDisponibilidad = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT servicio, disponible, motivo FROM disponibilidad_servicios"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al listar disponibilidad:", error);
    return res.status(500).json({ mensaje: "No se pudo obtener la disponibilidad de servicios." });
  }
};

// ── Actualizar (o crear) la disponibilidad de un servicio puntual ─────────
const actualizarDisponibilidad = async (req, res) => {
  const { servicio } = req.params;
  const { disponible, motivo } = req.body;

  if (typeof disponible !== "boolean") {
    return res.status(400).json({ mensaje: "El campo 'disponible' debe ser true o false." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO disponibilidad_servicios (servicio, disponible, motivo, actualizado_en)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (servicio)
       DO UPDATE SET disponible = $2, motivo = $3, actualizado_en = NOW()
       RETURNING servicio, disponible, motivo`,
      [servicio, disponible, motivo || null]
    );
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return res.status(500).json({ mensaje: "No se pudo actualizar la disponibilidad del servicio." });
  }
};

module.exports = { listarDisponibilidad, actualizarDisponibilidad };
