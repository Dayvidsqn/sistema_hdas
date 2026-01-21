import jwt from "jsonwebtoken";
import pool from "../db.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Usar variable de entorno para el secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLAVE_SECRETA");
    req.user = decoded; // { id, rol } - id es de la tabla usuarios
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

// Función auxiliar para obtener ID del profesor
export async function obtenerProfesorId(usuarioId) {
  try {
    const result = await pool.query(
      "SELECT id FROM profesores WHERE usuario_id = $1",
      [usuarioId]
    );
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error("Error obteniendo profesor_id:", error);
    return null;
  }
}