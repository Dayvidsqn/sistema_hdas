import express from "express";
import pool from "../db.js";
import { verificarToken, verificarRol, obtenerProfesorId } from "../middleware/authMiddleware.js";

const router = express.Router();

// Obtener cursos asignados al profesor
router.get("/mis-cursos", verificarToken, verificarRol(["profesor"]), async (req, res) => {
  try {
    console.log("=== DEBUG: /mis-cursos ===");
    console.log("Usuario autenticado:", req.user);
    
    // Obtener el ID del profesor desde el usuario autenticado
    const profesorId = await obtenerProfesorId(req.user.id);
    console.log("profesorId obtenido:", profesorId);
    
    if (!profesorId) {
      return res.status(404).json({ message: "Perfil de profesor no encontrado" });
    }

    // Consultar cursos asignados (SIN fecha_asignacion)
    const result = await pool.query(
      `SELECT 
        a.id,
        c.nombre as curso_nombre,
        a.grado,
        a.seccion,
        COALESCE(
          (SELECT COUNT(*) FROM alumnos WHERE grado = a.grado AND seccion = a.seccion), 
          0
        ) as total_alumnos,
        COALESCE(
          (SELECT COUNT(DISTINCT alumno_id) FROM notas WHERE asignacion_id = a.id), 
          0
        ) as notas_ingresadas
       FROM asignaciones a
       JOIN cursos c ON a.curso_id = c.id
       WHERE a.profesor_id = $1
       ORDER BY a.grado, a.seccion, c.nombre`,
      [profesorId]
    );

    console.log("Cursos encontrados:", result.rows.length);

    // Calcular progreso (porcentaje de alumnos con notas)
    const cursosConProgreso = result.rows.map(curso => {
      const progreso = curso.total_alumnos > 0 
        ? Math.round((curso.notas_ingresadas / curso.total_alumnos) * 100) 
        : 0;
      return { 
        ...curso, 
        progreso,
        // Si quieres una fecha simulada, puedes usar la actual
        fecha_asignacion: new Date().toISOString()
      };
    });

    res.json(cursosConProgreso);

  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error);
    res.status(500).json({ message: "Error al cargar cursos" });
  }
});

export default router;