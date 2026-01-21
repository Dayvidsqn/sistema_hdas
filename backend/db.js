import pkg from "pg";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, //|| `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a PostgreSQL:", process.env.DB_NAME || "Render DB");
    release();
  }
});

export default pool;
