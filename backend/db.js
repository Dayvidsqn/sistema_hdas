import pkg from "pg";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "sistema_hdas",
  password: process.env.DB_PASSWORD || "admin",
  port: parseInt(process.env.DB_PORT) || 5432,
});

// Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a PostgreSQL:", process.env.DB_NAME);
    release();
  }
});

export default pool;