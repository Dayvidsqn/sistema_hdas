import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login de estudiantes (con DNI)
router.post("/login", async (req, res) => {
  const { dni, password } = req.body;

  try {
    console.log("=== LOGIN ESTUDIANTE ===");
    console.log("DNI recibido:", dni);

    // Validar campos
    if (!dni || !password) {
      return res.status(400).json({ 
        message: "DNI y contraseña son requeridos" 
      });
    }

    // Buscar estudiante por DNI
    const result = await pool.query(
      `SELECT id, nombres, apellidos, dni, password, grado, seccion, activo 
       FROM alumnos 
       WHERE dni = $1 AND activo = true`,
      [dni]
    );

    if (result.rows.length === 0) {
      console.log("❌ Estudiante no encontrado o inactivo");
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const estudiante = result.rows[0];
    console.log("✅ Estudiante encontrado:", estudiante.nombres, estudiante.apellidos);

    // Verificar contraseña (texto plano por ahora)
    if (password !== estudiante.password) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT para estudiante
    const token = jwt.sign(
      { 
        id: estudiante.id, 
        dni: estudiante.dni,
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        rol: 'estudiante',
        grado: estudiante.grado,
        seccion: estudiante.seccion
      },
      process.env.JWT_SECRET || "CLAVE_SECRETA",
      { expiresIn: "8h" }
    );

    console.log("✅ Login exitoso para:", estudiante.nombres, estudiante.apellidos);

    res.json({
      token,
      rol: 'estudiante',
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      dni: estudiante.dni,
      grado: estudiante.grado,
      seccion: estudiante.seccion
    });

  } catch (error) {
    console.error("❌ Error en login estudiante:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Middleware para verificar token de estudiante
const verificarTokenEstudiante = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLAVE_SECRETA");
    if (decoded.rol !== 'estudiante') {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Obtener notas del estudiante
router.get("/mis-notas", verificarTokenEstudiante, async (req, res) => {
  try {
    const estudianteId = req.user.id;
    
    const result = await pool.query(
      `SELECT 
        n.bimestre,
        n.nota,
        c.nombre as curso_nombre,
        p.nombres as profesor_nombres,
        p.apellidos as profesor_apellidos
       FROM notas n
       JOIN asignaciones asig ON n.asignacion_id = asig.id
       JOIN cursos c ON asig.curso_id = c.id
       JOIN profesores p ON asig.profesor_id = p.id
       WHERE n.alumno_id = $1
       ORDER BY c.nombre, n.bimestre`,
      [estudianteId]
    );

    // Organizar notas por curso
    const cursosMap = {};
    result.rows.forEach(nota => {
      if (!cursosMap[nota.curso_nombre]) {
        cursosMap[nota.curso_nombre] = {
          curso_nombre: nota.curso_nombre,
          profesor: `${nota.profesor_nombres} ${nota.profesor_apellidos}`,
          notas: [null, null, null, null]
        };
      }
      cursosMap[nota.curso_nombre].notas[nota.bimestre - 1] = nota.nota;
    });

    // Calcular promedios
    const cursos = Object.values(cursosMap).map(curso => {
      const notasValidas = curso.notas.filter(n => n !== null);
      const promedio = notasValidas.length > 0 
        ? (notasValidas.reduce((a, b) => a + parseFloat(b), 0) / notasValidas.length).toFixed(2)
        : "-";
      return { ...curso, promedio };
    });

    res.json({ cursos });

  } catch (error) {
    console.error("Error al obtener notas:", error);
    res.status(500).json({ message: "Error al cargar notas" });
  }
});

export default router;