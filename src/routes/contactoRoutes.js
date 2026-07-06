const express = require("express");
const router = express.Router();
const { enviarContacto } = require("../controllers/contactoController");

router.post("/contacto", enviarContacto);

module.exports = router;
