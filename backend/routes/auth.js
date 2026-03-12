import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Eliminamos 'rol' de aquí

  try {
    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email y contraseña son requeridos" 
      });
    }

    // Buscar usuario SOLO por email (sin filtrar por rol)
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    
    // Verificar contraseña
    const validPassword = (password === user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        rol: user.rol, // Usamos el rol que viene de la BD
        email: user.email,
        nombre: user.nombre
      },
      process.env.JWT_SECRET || "CLAVE_SECRETA",
      { expiresIn: "8h" }
    );

    res.json({ 
      token, 
      rol: user.rol, // Enviamos el rol de la BD
      nombre: user.nombre,
      email: user.email
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;