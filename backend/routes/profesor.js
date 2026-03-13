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

// Obtener alumnos y notas de un curso específico
router.get("/mis-cursos/:asignacionId/alumnos", verificarToken, verificarRol(["profesor"]), async (req, res) => {
  try {
    const { asignacionId } = req.params;
    const { bimestre } = req.query;

    // Verificar que la asignación pertenezca al profesor
    const profesorId = await obtenerProfesorId(req.user.id);
    
    const asignacion = await pool.query(
      `SELECT a.*, c.nombre as curso_nombre 
       FROM asignaciones a
       JOIN cursos c ON a.curso_id = c.id
       WHERE a.id = $1 AND a.profesor_id = $2`,
      [asignacionId, profesorId]
    );

    if (asignacion.rows.length === 0) {
      return res.status(404).json({ message: "Curso no encontrado o no autorizado" });
    }

    // Obtener alumnos del grado y sección
    const alumnos = await pool.query(
      `SELECT 
        a.id,
        a.nombres,
        a.apellidos,
        n1.nota as nota_1,
        n2.nota as nota_2,
        n3.nota as nota_3,
        n4.nota as nota_4
       FROM alumnos a
       LEFT JOIN notas n1 ON n1.alumno_id = a.id AND n1.asignacion_id = $1 AND n1.bimestre = 1
       LEFT JOIN notas n2 ON n2.alumno_id = a.id AND n2.asignacion_id = $1 AND n2.bimestre = 2
       LEFT JOIN notas n3 ON n3.alumno_id = a.id AND n3.asignacion_id = $1 AND n3.bimestre = 3
       LEFT JOIN notas n4 ON n4.alumno_id = a.id AND n4.asignacion_id = $1 AND n4.bimestre = 4
       WHERE a.grado = $2 AND a.seccion = $3
       ORDER BY a.apellidos, a.nombres`,
      [asignacionId, asignacion.rows[0].grado, asignacion.rows[0].seccion]
    );

    res.json({
      curso: asignacion.rows[0],
      alumnos: alumnos.rows
    });

  } catch (error) {
    console.error("Error al cargar alumnos:", error);
    res.status(500).json({ message: "Error al cargar datos" });
  }
});

// Guardar o actualizar una nota
router.post("/guardar-nota", verificarToken, verificarRol(["profesor"]), async (req, res) => {
  const { alumno_id, asignacion_id, bimestre, nota } = req.body;

  try {
    // Verificar que la asignación pertenezca al profesor
    const profesorId = await obtenerProfesorId(req.user.id);
    
    const asignacion = await pool.query(
      "SELECT id FROM asignaciones WHERE id = $1 AND profesor_id = $2",
      [asignacion_id, profesorId]
    );

    if (asignacion.rows.length === 0) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (nota === null || nota === "") {
      // Si la nota está vacía, eliminar el registro si existe
      await pool.query(
        "DELETE FROM notas WHERE alumno_id = $1 AND asignacion_id = $2 AND bimestre = $3",
        [alumno_id, asignacion_id, bimestre]
      );
    } else {
      // Insertar o actualizar nota
      await pool.query(
        `INSERT INTO notas (alumno_id, asignacion_id, bimestre, nota)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (alumno_id, asignacion_id, bimestre) 
         DO UPDATE SET nota = $4`,
        [alumno_id, asignacion_id, bimestre, nota]
      );
    }

    res.json({ message: "Nota guardada correctamente" });

  } catch (error) {
    console.error("Error al guardar nota:", error);
    res.status(500).json({ message: "Error al guardar la nota" });
  }
});

export default router;