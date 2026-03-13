import { useState } from "react";
import fondo from "../assets/fondo-login.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Conectando...");

    try {
      const API = `${import.meta.env.VITE_API_URL}/auth`;

      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          // Eliminamos 'rol' del body
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.message || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);

      if (data.rol === "director") {
        window.location.href = "/director";
      } else if (data.rol === "profesor") {
        window.location.href = "/profesor/subir-trabajos";
      }

    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-xs"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo_das.png"
            alt="Logo del colegio"
            className="w-30 h-30 mb-2"
          />

          <h2 className="text-2xl font-bold text-center">
            Portal Docente HDAS
          </h2>
        </div>

        <p className="text-center text-gray-500 mb-6">
          Iniciar sesión
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Ingresar
        </button>

        {mensaje && (
          <p className="text-center mt-4 text-sm text-red-600">
            {mensaje}
          </p>
        )}
        <p className="text-center mt-4 text-sm text-gray-500">
          <a href="/login-estudiante" className="text-blue-600 hover:underline">¿Eres estudiante? Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  );
}

export default Login;