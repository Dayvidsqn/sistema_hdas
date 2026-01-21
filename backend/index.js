import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from "./routes/auth.js";
import archivosRoutes from "./routes/archivos.js";
import alumnosRoutes from "./routes/alumnos.js";

const app = express();

// Configurar CORS
app.use(cors({
  origin: "http://localhost:5173", // URL de tu frontend Vite
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Carpeta 'uploads' creada");
}

// Servir archivos estáticos
app.use("/uploads", express.static(uploadsDir));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/archivos", archivosRoutes);
app.use("/api/alumnos", alumnosRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "API del Sistema del Colegio activa",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      archivos: "/api/archivos",
      alumnos: "/api/alumnos"
    }
  });
});

// Middleware para manejar errores 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error("Error del servidor:", err);
  res.status(500).json({ 
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Carpeta uploads: ${uploadsDir}`);
});