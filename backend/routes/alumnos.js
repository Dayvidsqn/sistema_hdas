import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Obtener todos los alumnos (protegido para director)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Verificar que sea director
    if (req.user.rol !== "director") {
      return res.status(403).json({ message: "Acceso denegado. Solo para directores." });
    }

    const result = await pool.query(`
      SELECT id, nombres, apellidos, dni, grado, seccion, 
             fecha_nacimiento, direccion, telefono
      FROM alumnos
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
});

// Crear alumno (solo director)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Verificar que sea director
    if (req.user.rol !== "director") {
      return res.status(403).json({ message: "Acceso denegado. Solo para directores." });
    }

    const { nombres, apellidos, dni, grado, seccion, fecha_nacimiento, direccion, telefono } = req.body;

    // Validaciones
    if (!nombres || !apellidos || !dni) {
      return res.status(400).json({
        message: "Nombres, apellidos y DNI son obligatorios"
      });
    }

    // Verificar si DNI ya existe
    const dniCheck = await pool.query(
      "SELECT id FROM alumnos WHERE dni = $1",
      [dni]
    );

    if (dniCheck.rows.length > 0) {
      return res.status(400).json({
        message: "El DNI ya está registrado"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO alumnos 
      (nombres, apellidos, dni, grado, seccion, fecha_nacimiento, direccion, telefono)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        nombres,
        apellidos,
        dni,
        grado || null,
        seccion || null,
        fecha_nacimiento || null,
        direccion || null,
        telefono || null
      ]
    );

    res.status(201).json({
      message: "Alumno registrado correctamente",
      alumno: result.rows[0]
    });

  } catch (error) {
    console.error("Error al registrar alumno:", error);
    res.status(500).json({ message: "Error al registrar alumno" });
  }
});

// Eliminar alumno (solo director)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Verificar que sea director
    if (req.user.rol !== "director") {
      return res.status(403).json({ message: "Acceso denegado. Solo para directores." });
    }

    const { id } = req.params;

    // Validar que id sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // Verificar si el alumno existe
    const check = await pool.query("SELECT id FROM alumnos WHERE id = $1", [id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Eliminar
    await pool.query(`DELETE FROM alumnos WHERE id = $1`, [id]);

    res.json({ 
      message: "Alumno eliminado correctamente",
      id: parseInt(id)
    });

  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    res.status(500).json({ message: "Error al eliminar alumno" });
  }
});

export default router;