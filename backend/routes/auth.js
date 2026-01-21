import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password, rol } = req.body;

  try {
    // Validar campos
    if (!email || !password || !rol) {
      return res.status(400).json({ 
        message: "Email, contraseña y rol son requeridos" 
      });
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND rol = $2",
      [email, rol]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    
    // Verificar contraseña
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        rol: user.rol,
        email: user.email,
        nombre: user.nombre
      },
      process.env.JWT_SECRET || "CLAVE_SECRETA",
      { expiresIn: "8h" }
    );

    res.json({ 
      token, 
      rol: user.rol,
      nombre: user.nombre,
      email: user.email
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;