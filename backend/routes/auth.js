import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password, rol } = req.body;

  // ============================================
  // DEPURACIÓN EXTREMA (BORRAR DESPUÉS DE USAR)
  // ============================================
  console.log("\n=== 🚀 NUEVO INTENTO DE LOGIN ===");
  console.log("📦 BODY RECIBIDO (completo):", JSON.stringify(req.body, null, 2));
  console.log("📧 Email:", email);
  console.log("🔑 Rol:", rol);
  console.log("🔐 Contraseña (raw):", password);
  console.log("🔐 Tipo de contraseña:", typeof password);
  console.log("🔐 Longitud contraseña:", password?.length);
  console.log("🔐 Caracteres (códigos ASCII):", password ? [...password].map(c => c.charCodeAt(0)) : []);
  console.log("🔐 Representación JSON:", JSON.stringify(password));
  console.log("=================================\n");

  try {
    // Validar campos
    if (!email || !password || !rol) {
      console.log("❌ Error: campos faltantes");
      return res.status(400).json({ 
        message: "Email, contraseña y rol son requeridos" 
      });
    }

    console.log("🔍 Buscando usuario en BD...");
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND rol = $2",
      [email, rol]
    );

    if (result.rows.length === 0) {
      console.log("❌ Usuario no encontrado para:", email, "con rol", rol);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    console.log("✅ Usuario encontrado en BD:", user.email);
    console.log("🔐 Contraseña en BD (raw):", user.password);
    console.log("🔐 Longitud BD:", user.password.length);
    console.log("🔐 Caracteres BD (ASCII):", [...user.password].map(c => c.charCodeAt(0)));
    console.log("🔐 Representación JSON BD:", JSON.stringify(user.password));

    // Comparación directa en texto plano
    const validPassword = (password === user.password);
    console.log("🔐 ¿Contraseñas iguales?", validPassword);

    if (!validPassword) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    console.log("✅ Contraseña correcta, generando token...");

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

    console.log("✅ Login exitoso para:", user.email);
    res.json({ 
      token, 
      rol: user.rol,
      nombre: user.nombre,
      email: user.email
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;