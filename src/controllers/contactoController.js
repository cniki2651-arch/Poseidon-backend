const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarContacto = async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  // Validación básica en backend (nunca confíes solo en el frontend)
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const nombreValido = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre.trim());
  if (!nombreValido) {
    return res.status(400).json({ error: "El nombre solo puede contener letras." });
  }

  try {
    await transporter.sendMail({
      from: `"Formulario Web Poseidón" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: correo,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: `
        <h3>Nuevo mensaje desde el sitio web</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    return res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ error: "No se pudo enviar el mensaje. Intenta más tarde." });
  }
};

module.exports = { enviarContacto };
