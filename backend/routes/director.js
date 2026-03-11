import express from "express";
import pool from "../db.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

// Obtener todos los profesores
router.get("/profesores", verificarToken, verificarRol(["director"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.nombres, p.apellidos 
       FROM profesores p
       ORDER BY p.apellidos, p.nombres`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar profesores" });
  }
});

// Obtener todos los cursos
router.get("/cursos", verificarToken, verificarRol(["director"]), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cursos ORDER BY nombre"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar cursos" });
  }
});

// Obtener todas las asignaciones
router.get("/asignaciones", verificarToken, verificarRol(["director"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.grado,
        a.seccion,
        p.nombres as profesor_nombre,
        p.apellidos as profesor_apellido,
        c.nombre as curso_nombre
       FROM asignaciones a
       JOIN profesores p ON a.profesor_id = p.id
       JOIN cursos c ON a.curso_id = c.id
       ORDER BY a.grado, a.seccion, c.nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar asignaciones" });
  }
});

// Asignar curso a profesor
router.post("/asignar-curso", verificarToken, verificarRol(["director"]), async (req, res) => {
  const { profesor_id, curso_id, grado, seccion } = req.body;

  try {
    // Verificar que no exista ya la asignación
    const existe = await pool.query(
      "SELECT id FROM asignaciones WHERE profesor_id = $1 AND curso_id = $2 AND grado = $3 AND seccion = $4",
      [profesor_id, curso_id, grado, seccion]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "Esta asignación ya existe" });
    }

    // Insertar nueva asignación
    const result = await pool.query(
      `INSERT INTO asignaciones (profesor_id, curso_id, grado, seccion) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [profesor_id, curso_id, grado, seccion]
    );

    res.status(201).json({ 
      message: "Asignación creada correctamente",
      id: result.rows[0].id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar curso" });
  }
});

// Eliminar asignación
router.delete("/asignaciones/:id", verificarToken, verificarRol(["director"]), async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM asignaciones WHERE id = $1", [id]);
    res.json({ message: "Asignación eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar" });
  }
});

export default router;