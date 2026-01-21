import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // ✅ IMPORTAR FS CORRECTAMENTE
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================================================
   CONFIGURACIÓN DE MULTER
   =========================================================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurar que la carpeta uploads existe
    const uploadPath = "uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, nombre + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = [
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (extensionesPermitidas.includes(ext)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Tipo de archivo no permitido"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/* ===========================================================
   SUBIR ARCHIVOS (CORREGIDO)
   =========================================================== */

router.post(
  "/subir",
  authMiddleware,
  upload.array("archivos", 10),
  async (req, res) => {
    try {
      console.log("=== DEBUG: INICIO SUBIDA ===");
      console.log("Usuario autenticado:", req.user);
      console.log("Body recibido:", req.body);
      console.log("FILES RECIBIDOS:", req.files);

      const { descripcion } = req.body;

      if (!descripcion) {
        return res.status(400).json({ message: "La descripción es obligatoria" });
      }

      // Verificar que el usuario autenticado es profesor
      if (req.user.rol !== "profesor") {
        return res.status(403).json({ message: "Solo los profesores pueden subir archivos" });
      }

      console.log("Buscando profesor con usuario_id:", req.user.id);
      
      // Obtener el ID del profesor desde la tabla profesores
      const profesorResult = await pool.query(
        "SELECT id, nombres, apellidos FROM profesores WHERE usuario_id = $1",
        [req.user.id]
      );

      console.log("Resultado búsqueda profesor:", profesorResult.rows);

      if (profesorResult.rows.length === 0) {
        return res.status(404).json({ 
          message: "No se encontró el perfil de profesor asociado a este usuario. Contacte al administrador." 
        });
      }

      const profesor_id = profesorResult.rows[0].id;
      const profesor_nombre = profesorResult.rows[0].nombres + " " + profesorResult.rows[0].apellidos;
      
      console.log("Profesor encontrado:", { profesor_id, profesor_nombre });

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No se recibieron archivos" });
      }

      // Insertar cada archivo
      const archivosSubidos = [];
      for (const file of req.files) {
      const nombreOriginalCorregido = Buffer
        .from(file.originalname, "latin1")
        .toString("utf8");

      console.log("Subiendo archivo:", nombreOriginalCorregido);

      const result = await pool.query(
        `INSERT INTO archivos 
        (nombre_original, nombre_servidor, tipo, descripcion, profesor_id, fecha_subida)
        VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, nombre_original`,
        [
          nombreOriginalCorregido,
          file.filename,
          file.mimetype,
          descripcion,
          profesor_id
        ]
      );

      archivosSubidos.push(result.rows[0]);
    }

      console.log("=== DEBUG: SUBIDA EXITOSA ===");
      
      res.json({ 
        message: "Archivos subidos correctamente",
        count: req.files.length,
        archivos: archivosSubidos,
        profesor: profesor_nombre
      });

    } catch (error) {
      console.error("ERROR SUBIDA COMPLETO:", error);
      res.status(500).json({
        message: error.message || "Error desconocido en servidor",
        code: error.code || null
      });
    }
  }
);

/* ===========================================================
   LISTAR ARCHIVOS POR PROFESOR (RUTA PROTEGIDA)
   =========================================================== */

router.get("/profesor/mis-archivos", authMiddleware, async (req, res) => {
  try {
    // Verificar que es profesor
    if (req.user.rol !== "profesor") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Obtener ID del profesor
    const profesorResult = await pool.query(
      "SELECT id FROM profesores WHERE usuario_id = $1",
      [req.user.id]
    );

    if (profesorResult.rows.length === 0) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    const profesor_id = profesorResult.rows[0].id;

    const result = await pool.query(
      `SELECT 
        id,
        nombre_original,
        descripcion,
        fecha_subida,
        tipo
       FROM archivos
       WHERE profesor_id = $1
       ORDER BY fecha_subida DESC`,
      [profesor_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error al obtener archivos del profesor:", error);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
});

/* ===========================================================
   LISTAR TODOS LOS ARCHIVOS (CON NOMBRE DEL PROFESOR)
   =========================================================== */

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.nombre_original,
        a.nombre_servidor,
        a.tipo,
        a.fecha_subida,
        a.descripcion,
        a.profesor_id,
        (p.nombres || ' ' || p.apellidos) AS profesor_nombre
      FROM archivos a
      INNER JOIN profesores p ON p.id = a.profesor_id
      ORDER BY a.fecha_subida DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
});

/* ===========================================================
   LISTAR ARCHIVOS POR PROFESOR (ID específico)
   =========================================================== */

router.get("/profesor/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.nombre_original,
        a.descripcion,
        a.fecha_subida,
        (p.nombres || ' ' || p.apellidos) AS profesor_nombre
       FROM archivos a
       INNER JOIN profesores p ON p.id = a.profesor_id
       WHERE a.profesor_id = $1
       ORDER BY a.fecha_subida DESC`,
      [req.params.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error al obtener archivos del profesor:", error);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
});

/* ===========================================================
   DESCARGAR ARCHIVO
   =========================================================== */

router.get("/descargar/:nombre", (req, res) => {
  const filePath = path.resolve("uploads", req.params.nombre);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Archivo no encontrado" });
  }
  
  res.download(filePath);
});

/* ===========================================================
   ERRORES DE MULTER
   =========================================================== */

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        message: "El archivo es demasiado grande (máx. 10MB)" 
      });
    }
    return res.status(400).json({
      message: err.message || "Error de carga de archivo"
    });
  } else if (err) {
    console.error("Error general:", err);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
  next();
});

export default router;