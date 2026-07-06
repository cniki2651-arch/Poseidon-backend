const express = require("express");
const router = express.Router();
const {
  listarDisponibilidad,
  actualizarDisponibilidad,
} = require("../controllers/disponibilidadServiciosController");

// GET  /api/consumos/disponibilidad          -> lista el estado de todos los servicios
// PUT  /api/consumos/disponibilidad/:servicio -> actualiza disponible/motivo de un servicio
router.get("/disponibilidad", listarDisponibilidad);
router.put("/disponibilidad/:servicio", actualizarDisponibilidad);

module.exports = router;
