import express from "express";
import multer from "multer";
import path from "path"; // ✅ IMPORTACIÓN CORRECTA
import fs from "fs"; // ✅ IMPORTACIÓN CORRECTA
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configurar multer para memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/* ===========================================================
   SUBIR ARCHIVOS (GUARDAR EN BD COMO BYTEA)
   =========================================================== */

router.post("/subir", authMiddleware, upload.array("archivos", 10), async (req, res) => {
  try {
    console.log("=== INICIO SUBIDA A BD ===");
    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({ message: "La descripción es obligatoria" });
    }

    if (req.user.rol !== "profesor") {
      return res.status(403).json({ message: "Solo profesores pueden subir archivos" });
    }

    // Obtener ID del profesor
    const profesorResult = await pool.query(
      "SELECT id, nombres, apellidos FROM profesores WHERE usuario_id = $1",
      [req.user.id]
    );

    if (profesorResult.rows.length === 0) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    const profesor_id = profesorResult.rows[0].id;
    const profesor_nombre = `${profesorResult.rows[0].nombres} ${profesorResult.rows[0].apellidos}`;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se recibieron archivos" });
    }

    const archivosSubidos = [];

    for (const file of req.files) {
      // ✅ CORREGIDO: usar path.extname (sin require)
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      // Guardar en PostgreSQL: metadatos + archivo binario
      const result = await pool.query(
        `INSERT INTO archivos 
        (nombre_original, nombre_servidor, tipo, descripcion, profesor_id, fecha_subida, archivo_binario)
        VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id, nombre_original`,
        [
          file.originalname,
          uniqueName,
          file.mimetype,
          descripcion,
          profesor_id,
          file.buffer
        ]
      );

      archivosSubidos.push({
        id: result.rows[0].id,
        nombre: result.rows[0].nombre_original
      });
    }

    console.log("=== SUBIDA EXITOSA A BD ===");
    res.json({ 
      message: "Archivos subidos correctamente a la base de datos",
      count: archivosSubidos.length,
      archivos: archivosSubidos,
      profesor: profesor_nombre
    });

  } catch (error) {
    console.error("ERROR EN SUBIDA:", error);
    res.status(500).json({ 
      message: error.message || "Error al subir archivos"
    });
  }
});

/* ===========================================================
   LISTAR ARCHIVOS POR PROFESOR
   =========================================================== */

router.get("/profesor/mis-archivos", authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== "profesor") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

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
        nombre_servidor,
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
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
});

/* ===========================================================
   LISTAR TODOS LOS ARCHIVOS (para director)
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
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
});

/* ===========================================================
   DESCARGAR ARCHIVO DESDE LA BD
   =========================================================== */

router.get("/descargar/:id", authMiddleware, async (req, res) => {
  try {
    const archivoId = req.params.id;

    const result = await pool.query(
      `SELECT a.*, p.usuario_id as profesor_usuario_id 
       FROM archivos a
       INNER JOIN profesores p ON p.id = a.profesor_id
       WHERE a.id = $1`,
      [archivoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const archivo = result.rows[0];

    // Verificar permisos
    if (req.user.rol === 'profesor' && archivo.profesor_usuario_id !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para descargar este archivo" });
    }

    if (!archivo.archivo_binario) {
      return res.status(404).json({ 
        message: "El archivo no tiene datos binarios. Es un archivo antiguo que debe ser migrado." 
      });
    }

    res.setHeader('Content-Type', archivo.tipo);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(archivo.nombre_original)}"`);
    
    res.send(archivo.archivo_binario);

  } catch (error) {
    console.error("Error en descarga:", error);
    res.status(500).json({ message: "Error al descargar el archivo" });
  }
});

/* ===========================================================
   MIGRAR ARCHIVOS ANTIGUOS (9 y 10)
   =========================================================== */

router.post("/admin/migrar-archivos-antiguos", authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 'profesor') {
      return res.status(403).json({ message: "No autorizado" });
    }

    // IDs de los archivos que quieres migrar
    const idsAMigrar = [9, 10];
    const resultados = [];

    for (const id of idsAMigrar) {
      const archivo = await pool.query(
        "SELECT * FROM archivos WHERE id = $1",
        [id]
      );

      if (archivo.rows.length === 0) {
        resultados.push({ id, error: "Archivo no encontrado en BD" });
        continue;
      }

      const fileData = archivo.rows[0];
      
      // ✅ Usar path.resolve correctamente
      const filePath = path.resolve("uploads", fileData.nombre_servidor);
      
      if (!fs.existsSync(filePath)) {
        resultados.push({ 
          id, 
          nombre: fileData.nombre_original,
          error: "Archivo físico no encontrado en uploads/" 
        });
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);

      await pool.query(
        "UPDATE archivos SET archivo_binario = $1 WHERE id = $2",
        [fileBuffer, id]
      );

      resultados.push({ 
        id, 
        nombre: fileData.nombre_original,
        exito: true 
      });
    }

    res.json({ 
      message: "Migración completada",
      resultados 
    });

  } catch (error) {
    console.error("Error en migración:", error);
    res.status(500).json({ message: "Error al migrar archivos" });
  }
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
      message: "Error interno del servidor"
    });
  }
  next();
});

export default router;