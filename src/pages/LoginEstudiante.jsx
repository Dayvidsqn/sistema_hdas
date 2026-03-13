import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginEstudiante() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const API = `${import.meta.env.VITE_API_URL}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/estudiantes/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || "Error al iniciar sesión");
        setCargando(false);
        return;
      }

      // Guardar datos
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("estudiante", JSON.stringify({
        nombres: data.nombres,
        apellidos: data.apellidos,
        dni: data.dni,
        grado: data.grado,
        seccion: data.seccion
      }));

      navigate("/estudiante/mis-notas");

    } catch (error) {
      setMensaje("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-sky-400">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-2">Portal del Estudiante</h2>
        <p className="text-center text-gray-500 mb-6">Ingrese con su DNI</p>

        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          disabled={cargando}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            cargando ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        {mensaje && <p className="text-center mt-4 text-sm text-red-600">{mensaje}</p>}

        <p className="text-center mt-4 text-sm text-gray-500">
          <a href="/" className="text-blue-600 hover:underline">¿Eres profesor o director?</a>
        </p>
      </form>
    </div>
  );
}